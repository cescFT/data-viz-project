function calculateActualYear() {
    const currentDate = new Date();
    actualYear = currentDate.getFullYear();

    $('#year').text("© " + actualYear);
}