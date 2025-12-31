
import Swal from 'sweetalert2'
import './swal-custom.css'

export async function confirmCloseJob() {
    return Swal.fire({
        title: 'Close Job?',
        text: 'Closing this job will hide it from freelancers, prevent new proposals, and you will not be able to accept any existing proposals. Do you want to continue?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Close Job',
        cancelButtonText: 'Cancel',
        reverseButtons: true,
        // use the warning (red) style for close/edit confirmation
        customClass: {
            popup: 'swal-warning',
            confirmButton: 'swal-warning-confirm',
            cancelButton: 'swal-warning-cancel'
        }
    })
}

export function showCannotEditAlert() {
    return Swal.fire({
        title: 'Cannot edit',
        text: 'This job already has proposals. Editing is restricted to preserve proposal integrity. Consider closing the job instead.',
        icon: 'warning',
        confirmButtonText: 'OK',
        customClass: {
            popup: 'swal-warning',
            confirmButton: 'swal-warning-confirm'
        }
    })
}

export async function confirmDeleteJob() {
    return Swal.fire({
        title: 'Delete Job?',
        text: 'Are you sure you want to permanently delete this job? This action cannot be undone.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'Cancel',
        reverseButtons: true,
        customClass: {
            popup: 'swal-delete',
            confirmButton: 'swal-delete-confirm'
        }
    })
}
