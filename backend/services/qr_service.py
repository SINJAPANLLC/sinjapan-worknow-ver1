import qrcode
import io
import base64
from typing import Optional
from datetime import datetime
from uuid import UUID
from .postgres_base import PostgresService

class QRService:
    def __init__(self, db: PostgresService):
        self.db = db
    
    async def get_company_qr_code(self, company_id: str) -> Optional[dict]:
        """Get QR code for a company"""
        query = "SELECT qr_code_secret FROM users WHERE id = %s AND role = 'company'"
        result = await self.db.fetchone(query, (company_id,))
        
        if not result or not result['qr_code_secret']:
            # Generate new QR code secret if not exists
            import uuid
            qr_secret = str(uuid.uuid4())
            update_query = "UPDATE users SET qr_code_secret = %s WHERE id = %s"
            await self.db.execute(update_query, (qr_secret, company_id))
        else:
            qr_secret = result['qr_code_secret']
        
        # Generate QR code image
        qr = qrcode.QRCode(version=1, box_size=10, border=5)
        qr.add_data(qr_secret)
        qr.make(fit=True)
        
        img = qr.make_image(fill_color="black", back_color="white")
        
        # Convert to base64
        buffer = io.BytesIO()
        img.save(buffer, format='PNG')
        img_str = base64.b64encode(buffer.getvalue()).decode()
        
        return {
            'qr_code_secret': qr_secret,
            'qr_code_image': f'data:image/png;base64,{img_str}'
        }
    
    async def check_in(self, worker_id: str, qr_code_secret: str, assignment_id: Optional[str] = None) -> dict:
        """Worker checks in using company's QR code"""
        # Verify QR code belongs to a valid company
        query = "SELECT id, full_name FROM users WHERE qr_code_secret = %s AND role = 'company'"
        company = await self.db.fetchone(query, (qr_code_secret,))
        
        if not company:
            raise ValueError("Invalid QR code")
        
        company_id = company['id']
        
        # If assignment_id provided, use it
        if assignment_id:
            # Verify assignment exists and belongs to worker
            assign_query = """
                SELECT a.*, j.company_id 
                FROM assignments a
                JOIN jobs j ON a.job_id = j.id
                WHERE a.id = %s AND a.worker_id = %s
            """
            assignment = await self.db.fetchone(assign_query, (assignment_id, worker_id))
            
            if not assignment:
                raise ValueError("Assignment not found")
            
            if assignment['company_id'] != company_id:
                raise ValueError("QR code does not match assignment company")
            
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
                'company_name': company['full_name']
            }
        else:
            # Find active assignment for this worker and company
            find_query = """
                SELECT a.* 
                FROM assignments a
                JOIN jobs j ON a.job_id = j.id
                WHERE a.worker_id = %s 
                AND j.company_id = %s 
                AND a.status = 'active'
                AND a.started_at IS NULL
                ORDER BY a.created_at DESC
                LIMIT 1
            """
            assignment = await self.db.fetchone(find_query, (worker_id, company_id))
            
            if not assignment:
                raise ValueError("No active assignment found for this company")
            
            # Update assignment with check-in time
            update_query = """
                UPDATE assignments 
                SET started_at = NOW() 
                WHERE id = %s
                RETURNING *
            """
            updated = await self.db.fetchone(update_query, (assignment['id'],))
            
            return {
                'success': True,
                'assignment_id': assignment['id'],
                'checked_in_at': updated['started_at'].isoformat(),
                'company_name': company['full_name']
            }
    
    async def check_out(self, worker_id: str, qr_code_secret: str, assignment_id: Optional[str] = None) -> dict:
        """Worker checks out using company's QR code"""
        # Verify QR code belongs to a valid company
        query = "SELECT id, full_name FROM users WHERE qr_code_secret = %s AND role = 'company'"
        company = await self.db.fetchone(query, (qr_code_secret,))
        
        if not company:
            raise ValueError("Invalid QR code")
        
        company_id = company['id']
        
        # If assignment_id provided, use it
        if assignment_id:
            # Verify assignment exists and belongs to worker
            assign_query = """
                SELECT a.*, j.company_id 
                FROM assignments a
                JOIN jobs j ON a.job_id = j.id
                WHERE a.id = %s AND a.worker_id = %s AND a.started_at IS NOT NULL
            """
            assignment = await self.db.fetchone(assign_query, (assignment_id, worker_id))
            
            if not assignment:
                raise ValueError("Assignment not found or not checked in")
            
            if assignment['company_id'] != company_id:
                raise ValueError("QR code does not match assignment company")
            
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
            
            return {
                'success': True,
                'assignment_id': assignment_id,
                'checked_out_at': completed_at.isoformat(),
                'hours_worked': round(hours_worked, 2),
                'company_name': company['full_name']
            }
        else:
            # Find checked-in assignment for this worker and company
            find_query = """
                SELECT a.* 
                FROM assignments a
                JOIN jobs j ON a.job_id = j.id
                WHERE a.worker_id = %s 
                AND j.company_id = %s 
                AND a.status = 'active'
                AND a.started_at IS NOT NULL
                AND a.completed_at IS NULL
                ORDER BY a.started_at DESC
                LIMIT 1
            """
            assignment = await self.db.fetchone(find_query, (worker_id, company_id))
            
            if not assignment:
                raise ValueError("No checked-in assignment found for this company")
            
            # Update assignment with check-out time
            update_query = """
                UPDATE assignments 
                SET completed_at = NOW(), status = 'completed' 
                WHERE id = %s
                RETURNING *
            """
            updated = await self.db.fetchone(update_query, (assignment['id'],))
            
            # Calculate hours worked
            started_at = updated['started_at']
            completed_at = updated['completed_at']
            hours_worked = (completed_at - started_at).total_seconds() / 3600
            
            return {
                'success': True,
                'assignment_id': assignment['id'],
                'checked_out_at': completed_at.isoformat(),
                'hours_worked': round(hours_worked, 2),
                'company_name': company['full_name']
            }
