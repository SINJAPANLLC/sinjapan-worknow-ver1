import qrcode
import io
import base64
import secrets
from typing import Optional
from datetime import datetime, timedelta
from .postgres_base import PostgresService

class QRService:
    def __init__(self, db: PostgresService):
        self.db = db
        self.token_validity_minutes = 30  # QR code valid for 30 minutes
        
    def _create_payment_for_assignment(self, assignment_id: str, hours_worked: float) -> None:
        """Create payment record for completed assignment based on hours worked"""
        from .payment_service import PaymentService
        
        with self.db._get_cursor() as cursor:
            cursor.execute("""
                SELECT j.hourly_rate
                FROM assignments a
                JOIN jobs j ON a.job_id = j.id
                WHERE a.id = %s
            """, (assignment_id,))
            result = cursor.fetchone()
            
            if result and result['hourly_rate']:
                hourly_rate = result['hourly_rate']
                amount = int(hours_worked * hourly_rate)
                
                payment_service = PaymentService()
                payment_service.create_internal_payment(assignment_id, amount)
    
    async def generate_qr_token(
        self, 
        assignment_id: str, 
        company_id: str, 
        token_type: str
    ) -> dict:
        """Generate a time-limited, single-use QR token for an assignment"""
        # Generate a secure random token
        token = secrets.token_urlsafe(32)
        expires_at = datetime.utcnow() + timedelta(minutes=self.token_validity_minutes)
        
        # Store token in database
        query = """
            INSERT INTO qr_tokens (assignment_id, company_id, token, token_type, expires_at)
            VALUES (%s, %s, %s, %s, %s)
            RETURNING id, token, expires_at
        """
        result = await self.db.fetchone(
            query, 
            (assignment_id, company_id, token, token_type, expires_at)
        )
        
        # Generate QR code image with JSON data
        qr = qrcode.QRCode(version=1, box_size=10, border=5)
        import json
        qr_data = {
            'token': token,
            'assignment_id': assignment_id,
            'type': token_type
        }
        qr.add_data(json.dumps(qr_data))
        qr.make(fit=True)
        
        img = qr.make_image(fill_color="black", back_color="white")
        
        # Convert to base64
        buffer = io.BytesIO()
        img.save(buffer, format='PNG')
        img_str = base64.b64encode(buffer.getvalue()).decode()
        
        return {
            'token': token,
            'qr_code_image': f'data:image/png;base64,{img_str}',
            'expires_at': expires_at.isoformat(),
            'assignment_id': assignment_id,
            'token_type': token_type
        }
    
    async def get_check_in_qr(self, assignment_id: str) -> dict:
        """Generate check-in QR code for an assignment"""
        # Verify assignment exists and get company
        query = """
            SELECT a.*, j.company_id, u.full_name as company_name
            FROM assignments a
            JOIN jobs j ON a.job_id = j.id
            JOIN users u ON j.company_id = u.id
            WHERE a.id = %s
        """
        assignment = await self.db.fetchone(query, (assignment_id,))
        
        if not assignment:
            raise ValueError("Assignment not found")
        
        if assignment['started_at'] is not None:
            raise ValueError("Assignment already started")
        
        # Invalidate any existing unused check-in tokens for this assignment
        await self.db.execute(
            """
            UPDATE qr_tokens 
            SET used_at = NOW() 
            WHERE assignment_id = %s 
            AND token_type = 'check_in' 
            AND used_at IS NULL
            """,
            (assignment_id,)
        )
        
        # Generate new token
        token_data = await self.generate_qr_token(
            assignment_id,
            assignment['company_id'],
            'check_in'
        )
        
        token_data['company_name'] = assignment['company_name']
        return token_data
    
    async def get_check_out_qr(self, assignment_id: str) -> dict:
        """Generate check-out QR code for an assignment"""
        # Verify assignment exists and is checked in
        query = """
            SELECT a.*, j.company_id, u.full_name as company_name
            FROM assignments a
            JOIN jobs j ON a.job_id = j.id
            JOIN users u ON j.company_id = u.id
            WHERE a.id = %s
        """
        assignment = await self.db.fetchone(query, (assignment_id,))
        
        if not assignment:
            raise ValueError("Assignment not found")
        
        if assignment['started_at'] is None:
            raise ValueError("Assignment not checked in yet")
        
        if assignment['completed_at'] is not None:
            raise ValueError("Assignment already completed")
        
        # Invalidate any existing unused check-out tokens for this assignment
        await self.db.execute(
            """
            UPDATE qr_tokens 
            SET used_at = NOW() 
            WHERE assignment_id = %s 
            AND token_type = 'check_out' 
            AND used_at IS NULL
            """,
            (assignment_id,)
        )
        
        # Generate new token
        token_data = await self.generate_qr_token(
            assignment_id,
            assignment['company_id'],
            'check_out'
        )
        
        token_data['company_name'] = assignment['company_name']
        return token_data
    
    async def check_in(self, worker_id: str, token: str, assignment_id: str) -> dict:
        """Worker checks in using time-limited QR token"""
        # Verify token exists, is valid, and unused
        token_query = """
            SELECT qt.*, a.worker_id, a.started_at, j.company_id, u.full_name as company_name
            FROM qr_tokens qt
            JOIN assignments a ON qt.assignment_id = a.id
            JOIN jobs j ON a.job_id = j.id
            JOIN users u ON j.company_id = u.id
            WHERE qt.token = %s 
            AND qt.assignment_id = %s
            AND qt.token_type = 'check_in'
        """
        token_data = await self.db.fetchone(token_query, (token, assignment_id))
        
        if not token_data:
            raise ValueError("Invalid QR code or assignment")
        
        # Verify worker
        if token_data['worker_id'] != worker_id:
            raise ValueError("This assignment is not assigned to you")
        
        # Check if already used
        if token_data['used_at'] is not None:
            raise ValueError("QR code has already been used")
        
        # Check if expired
        if datetime.utcnow() > token_data['expires_at']:
            raise ValueError("QR code has expired. Please request a new one.")
        
        # Check if already checked in
        if token_data['started_at'] is not None:
            raise ValueError("Already checked in")
        
        # Mark token as used
        await self.db.execute(
            "UPDATE qr_tokens SET used_at = NOW() WHERE id = %s",
            (token_data['id'],)
        )
        
        # Update assignment with check-in time
        update_query = """
            UPDATE assignments 
            SET started_at = NOW(), status = 'active' 
            WHERE id = %s
            RETURNING *
        """
        updated = await self.db.fetchone(update_query, (assignment_id,))
        
        return {
            'success': True,
            'assignment_id': assignment_id,
            'checked_in_at': updated['started_at'].isoformat(),
            'company_name': token_data['company_name']
        }
    
    async def check_out(self, worker_id: str, token: str, assignment_id: str) -> dict:
        """Worker checks out using time-limited QR token"""
        # Verify token exists, is valid, and unused
        token_query = """
            SELECT qt.*, a.worker_id, a.started_at, a.completed_at, 
                   j.company_id, u.full_name as company_name
            FROM qr_tokens qt
            JOIN assignments a ON qt.assignment_id = a.id
            JOIN jobs j ON a.job_id = j.id
            JOIN users u ON j.company_id = u.id
            WHERE qt.token = %s 
            AND qt.assignment_id = %s
            AND qt.token_type = 'check_out'
        """
        token_data = await self.db.fetchone(token_query, (token, assignment_id))
        
        if not token_data:
            raise ValueError("Invalid QR code or assignment")
        
        # Verify worker
        if token_data['worker_id'] != worker_id:
            raise ValueError("This assignment is not assigned to you")
        
        # Check if already used
        if token_data['used_at'] is not None:
            raise ValueError("QR code has already been used")
        
        # Check if expired
        if datetime.utcnow() > token_data['expires_at']:
            raise ValueError("QR code has expired. Please request a new one.")
        
        # Check if checked in
        if token_data['started_at'] is None:
            raise ValueError("Not checked in yet")
        
        # Check if already checked out
        if token_data['completed_at'] is not None:
            raise ValueError("Already checked out")
        
        # Mark token as used
        await self.db.execute(
            "UPDATE qr_tokens SET used_at = NOW() WHERE id = %s",
            (token_data['id'],)
        )
        
        # Update assignment with check-out time
        update_query = """
            UPDATE assignments 
            SET completed_at = NOW(), status = 'completed' 
            WHERE id = %s
            RETURNING *
        """
        updated = await self.db.fetchone(update_query, (assignment_id,))
        
        # Calculate hours worked
        started_at = updated['started_at']
        completed_at = updated['completed_at']
        hours_worked = (completed_at - started_at).total_seconds() / 3600
        
        # Automatically create payment for completed assignment
        try:
            self._create_payment_for_assignment(assignment_id, hours_worked)
        except Exception as e:
            print(f"Failed to create payment for assignment {assignment_id}: {str(e)}")
        
        return {
            'success': True,
            'assignment_id': assignment_id,
            'checked_out_at': completed_at.isoformat(),
            'hours_worked': round(hours_worked, 2),
            'company_name': token_data['company_name']
        }
