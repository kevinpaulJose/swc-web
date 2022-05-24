import Papa from "papaparse";

function CVReaderComponent() {
  const changeHandler = (event) => {
    Papa.parse(event.target.files[0], {
      header: false,
      skipEmptyLines: true,
      complete: function (results) {
        console.log(results.data);
      },
    });
  };

  return (
    <div>
      <input
        type="file"
        name="file"
        accept=".csv"
        style={{ display: "block", margin: "10px auto" }}
        onChange={changeHandler}
      />
    </div>
  );
}

export default CVReaderComponent;
