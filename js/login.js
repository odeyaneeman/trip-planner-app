document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm') || document.querySelector('form');

    if (!loginForm) {
        console.error("לא נתפס טופס התחברות בדף!");
        return;
    }

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const usernameInput = document.getElementById('username') || document.querySelector('input[type="text"]');
        const passwordInput = document.getElementById('password') || document.querySelector('input[type="password"]');

        const username = usernameInput.value.trim();
        const password = passwordInput.value.trim();

        try {
            const response = await fetch('http://localhost:3000/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('loggedInUser', data.username);

                Swal.fire({
                    title: `ברוך הבא, ${username}!`,
                    text: 'התחברת בהצלחה, מעביר אותך לדף הבית...',
                    icon: 'success',
                    showConfirmButton: false, 
                    timer: 2000,
                    timerProgressBar: true
                }).then(() => {
                    window.location.href = 'home.html'; 
                });
            } else {
                Swal.fire({
                    title: 'ההתחברות נכשלה',
                    text: data.error,
                    icon: 'error',
                    confirmButtonText: 'נסה שוב',
                    confirmButtonColor: '#e1b12c'
                });
            }

        } catch (error) {
            console.error("שגיאה בהתחברות לשרת:", error);
            Swal.fire({
                title: 'שגיאת תקשורת',
                text: 'לא ניתן להתחבר לשרת.',
                icon: 'error',
                confirmButtonText: 'סגור'
            });
        }
    });
});