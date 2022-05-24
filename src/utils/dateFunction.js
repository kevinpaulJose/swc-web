export function formatDate(setTime) {
  var month = setTime.getUTCMonth() + 1; //months from 1-12
  var day = setTime.getUTCDate();
  var year = setTime.getUTCFullYear();

  let newdate = month + "/" + day + "/" + year;
  return newdate;
}
