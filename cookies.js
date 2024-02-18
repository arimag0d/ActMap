function checkAuthStatus() {
    const authToken = document.cookie
        .split('; ')
        .find(row => row.startsWith('authToken='))
        ?.split('=')[1];
    
    if (authToken) {
        document.querySelector('.btn-user').setAttribute('data-bs-target', '#profileModal');
        document.querySelector('.btn-add-marker').setAttribute('data-bs-target', '#offcanvasAddMarker');
        document.querySelector('.btn-add-marker').setAttribute('data-bs-toggle', 'offcanvas');
        document.querySelector('.btn-add-marker').setAttribute('aria-controls', '#offcanvasAddMarker');

        $(document).ready(function(){
            $("#button-add-marker").click(function(){
                $("#buttons-container").hide();
            });
        });
    }
}

window.onload = checkAuthStatus;