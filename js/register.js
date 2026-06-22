document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('registerForm') || document.querySelector('form');

    if (!registerForm) {
        console.error("לא נתפס טופס הרשמה בדף!");
        return;
    }

    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const inputs = document.querySelectorAll('form input');
        
        const firstName = inputs[0]?.value.trim();
        const lastName = inputs[1]?.value.trim();
        const email = inputs[2]?.value.trim();
        const username = inputs[3]?.value.trim();
        const password = inputs[4]?.value.trim();
        const confirmPassword = inputs[5]?.value.trim();

        if (password !== confirmPassword) {
            Swal.fire({
                title: 'אופס...',
                text: 'הסיסמאות אינן תואמות!',
                icon: 'error',
                confirmButtonText: 'אוקיי',
                confirmButtonColor: '#e1b12c' 
            });
            return;
        }

        if (!firstName || !lastName || !email || !username || !password) {
            Swal.fire({
                title: 'שדות חסרים',
                text: 'נא למלא את כל השדות המבוקשים בטופס',
                icon: 'warning',
                confirmButtonText: 'הבנתי',
                confirmButtonColor: '#e1b12c'
            });
            return;
        }

        try {
            const response = await fetch('/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ firstName, lastName, email, username, password })
            });

            const data = await response.json();

            if (response.ok) {
                Swal.fire({
                    title: 'כל הכבוד!',
                    text: 'ההרשמה בוצעה בהצלחה! מיד תועברי למסך ההתחברות',
                    icon: 'success',
                    confirmButtonText: 'איזה כיף!',
                    confirmButtonColor: '#4cd137',
                    timer: 3000, 
                    timerProgressBar: true
                }).then(() => {
                    window.location.href = 'login.html'; 
                });
            } else {
                Swal.fire({
                    title: 'שגיאה ברישום',
                    text: data.error,
                    icon: 'error',
                    confirmButtonText: 'ניסיון נוסף',
                    confirmButtonColor: '#e1b12c'
                });
            }

        } catch (error) {
            console.error("שגיאה בהתחברות לשרת:", error);
            Swal.fire({
                title: 'שגיאת תקשורת',
                text: 'לא ניתן להתחבר לשרת כרגע.',
                icon: 'error',
                confirmButtonText: 'סגור'
            });
        }
    });
});