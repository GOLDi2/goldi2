function filter_table(element) {
    // Declare variables
    var filter, tr, td, i, txtValue;
    filter = element.value.toUpperCase();
    td_index = element.parentElement.cellIndex;
    body = element.parentElement.parentElement.parentElement.parentElement.getElementsByTagName("tbody")[0];
    tr = body.getElementsByTagName("tr");
  
    for (i = 0; i < tr.length; i++) {
      td = tr[i].getElementsByTagName("td")[td_index];
      if (td) {
        txtValue = td.textContent || td.innerText;
        if (txtValue.toUpperCase().indexOf(filter) > -1) {
          tr[i].style.display = "";
        } else {
          tr[i].style.display = "none";
        }
      }
    }
}

document.addEventListener("DOMContentLoaded", ()=>{
  document.querySelectorAll('.copy-on-click').forEach((element) => {
    element.addEventListener('click', () => {
      navigator.clipboard.writeText(element.innerText);
    })
  });
}, false)