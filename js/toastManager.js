function showNotify(message, type = "dark", delay = 3000) {
    const toastEl = document.getElementById("appToast");
    const toastBody = document.getElementById("appToastBody");

    toastEl.className = `toast align-items-center text-bg-${type} border-0`;
    toastBody.innerHTML = message;

    const toast = new bootstrap.Toast(toastEl, {
        delay: delay,
        autohide: true
    });

    toast.show();
}
