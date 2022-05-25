import React from "react";
import {
  Button,
  Container,
  Dropdown,
  DropdownButton,
  Form,
  Modal,
  Table,
} from "react-bootstrap";
import { getSetTime, setData } from "../../firebase/functions";
import { formatDate } from "../../utils/dateFunction";
import CSVReaderComponent from "./CVReaderComponent";
import Papa from "papaparse";
import "./general.css";

// import "react-dropdown/style.css";

class GeneralListComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selected: "Group 1",
      addModal: false,
      addData: [],
      canAddData: true,
      addInputData: [],
      newData: [
        // { id: 3, name: "kevin", city: "Tvl", phone: "234234" },
        // { id: 4, name: "paul", city: "Cbe", phone: "234634" },
        // { id: 5, name: "paul", city: "Cbe", phone: "234634" },
        // { id: 6, name: "paul", city: "Cbe", phone: "234634" },
      ],
      name: "",
      city: "",
      phone: "",
      error: false,
      selectedWeek: "Week 1",
      currentWeek: 1,
      saving: false,
    };
  }
  componentDidMount() {
    this.getSelectedWeek();
  }

  getSelectedWeek = async () => {
    let setTime = await getSetTime();
    const date1 = setTime;
    const date2 = new Date();
    const diffTime = Math.abs(date2 - date1);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    console.log(Math.ceil(diffDays / 7));
    this.setState({
      currentWeek: Math.ceil(diffDays / 7),
      selectedWeek: "Week " + Math.ceil(diffDays / 7).toString(),
    });
  };

  triggerAddData = () => {
    this.setState({
      canAddData: !this.state.canAddData,
      name: "",
      city: "",
      phone: "",
    });
  };
  checkAddData = () => {
    if (this.state.canAddData) {
      this.setState({ canAddData: false });
    }
  };
  addData = () => {
    if (
      this.state.name === "" ||
      this.state.city === "" ||
      this.state.phone === ""
    ) {
      this.setState({ error: true });
    } else {
      let defaultPayment = {};
      for (let i = 1; i < 26; i++) {
        defaultPayment["Week " + i.toString()] = true;
      }
      console.log(defaultPayment);
      let temp = {
        id: this.state.addData.length + 1 + this.state.newData.length,
        name: this.state.name,
        city: this.state.city,
        phone: this.state.phone,
        group: this.state.selected,
        payment: defaultPayment,
      };
      let arr = this.state.newData;
      arr.push(temp);
      this.setState({ newData: arr });
      this.triggerAddData();
    }
  };
  saveChanges = async () => {
    this.setState({ saving: true });
    // let done =
    let done = await setData(this.state.newData);

    if (done) {
      this.setState({ newData: [], addModal: false, saving: false });
    }
  };

  getSelectedData = (id) => {
    let index = this.state.newData.findIndex((v) => v.id === id);
    // console.log(index);
    let newArray = this.state.newData.slice(
      index + 1,
      this.state.newData.length
    );
    // console.log(newArray);
    let updateData = this.state.newData.filter((v) => v.id !== id);
    newArray.forEach((v, i) => {
      //   console.log(v.id);
      let internalIndex = updateData.findIndex((val) => val.id === v.id);
      updateData[internalIndex].id--;
    });
    this.setState({ newData: updateData });
  };

  //   CVReaderComponent = () => {
  changeHandler = (event) => {
    Papa.parse(event.target.files[0], {
      header: false,
      skipEmptyLines: true,
      complete: (results) => {
        let arr = this.state.newData;
        results.data.forEach((value, key) => {
          let defaultPayment = {};
          for (let i = 1; i < 26; i++) {
            defaultPayment["Week " + i.toString()] = true;
          }
          //   console.log(defaultPayment);
          let temp = {
            id: this.state.addData.length + 1 + this.state.newData.length,
            name: value[0],
            city: value[1],
            phone: value[2],
            group: this.state.selected,
            payment: defaultPayment,
          };
          arr.push(temp);
          this.setState({ newData: arr });
        });

        // console.log(results.data);
      },
    });
  };
  // };

  _renderCVReader = () => {
    return (
      <div>
        <input
          type="file"
          name="file"
          accept=".csv"
          style={{ display: "inline-block", margin: "10px auto" }}
          onChange={this.changeHandler}
        />
      </div>
    );
  };
  _renderDropdown = () => {
    const options = [];
    for (let i = 1; i < 31; i++) {
      options.push("Group " + i.toString());
    }
    return (
      <DropdownButton
        id="dropdown-basic-button"
        variant="secondary"
        menuVariant="dark"
        title={this.state.selected}
      >
        {options.map((value, key) => (
          <div>
            <Dropdown.Item onClick={() => this.setState({ selected: value })}>
              {value}
            </Dropdown.Item>
            <Dropdown.Divider />
          </div>
        ))}
      </DropdownButton>
    );
  };
  _renderWeekDropdown = () => {
    const options = [];
    for (let i = 1; i < 8; i++) {
      options.push("Week " + i.toString());
    }
    return (
      <DropdownButton
        id="dropdown-basic-button"
        variant="outline-success"
        className="week"
        // menuVariant="dark"
        title={this.state.selectedWeek}
      >
        {options.map((value, key) => (
          <div>
            <Dropdown.Item
              disabled={parseInt(value.split(" ")[1]) > this.state.currentWeek}
              onClick={() => this.setState({ selectedWeek: value })}
            >
              {value}
            </Dropdown.Item>
            <Dropdown.Divider />
          </div>
        ))}
      </DropdownButton>
    );
  };
  _displayInput = ({ id, name, city, phone }) => {
    return (
      <tr key={id.toString() + name}>
        <td>{id}</td>
        <td>{name}</td>
        <td>{city}</td>
        <td>{phone}</td>
        <td
          colSpan={2}
          className="close-button"
          style={{ textAlign: "center" }}
          onClick={() => this.getSelectedData(id)}
        >
          x
        </td>
      </tr>
    );
  };
  _displayBlankInput = () => {
    return (
      <tr>
        <td>{this.state.addData.length + 1 + this.state.newData.length}</td>
        <td>
          <Form.Control
            value={this.state.name}
            onChange={(e) => {
              this.setState({ name: e.target.value });
            }}
            placeholder="name"
          />
        </td>
        <td>
          <Form.Control
            value={this.state.city}
            placeholder="city"
            onChange={(e) => {
              this.setState({ city: e.target.value });
            }}
          />
        </td>
        <td>
          <Form.Control
            value={this.state.phone}
            placeholder="phone"
            type="phone"
            onChange={(e) => {
              this.setState({ phone: e.target.value });
            }}
          />
        </td>
        <td
          className="close-button"
          style={{
            textAlign: "center",
            justifyContent: "center",
          }}
        >
          <span
            onClick={() => this.addData()}
            style={{ padding: 5, color: "green", display: "inline" }}
          >
            &#10003;
          </span>
        </td>
        <td
          className="close-button"
          style={{
            textAlign: "center",
            justifyContent: "center",
          }}
        >
          <span
            onClick={() => this.triggerAddData()}
            style={{ padding: 5, color: "grey", display: "inline" }}
          >
            &#x1F5D1;
          </span>
        </td>
      </tr>
    );
  };

  render() {
    return (
      <div className="container   mt-4" id="outerBox">
        <Modal show={this.state.addModal}>
          <Modal.Header>
            <Modal.Title>
              <span>Add in {this.state.selected}</span>
              {/* <CSVReaderComponent /> */}
              <this._renderCVReader />
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Table striped bordered hover size="sm">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>City</th>
                  <th>Phone</th>
                  <th colSpan={2}></th>
                </tr>
              </thead>
              <tbody>
                {this.state.newData.map((value, key) => {
                  return (
                    <this._displayInput
                      id={value.id}
                      name={value.name}
                      city={value.city}
                      phone={value.phone}
                    />
                  );
                })}
                {!this.state.canAddData && <this._displayBlankInput />}
              </tbody>
            </Table>
            <div>
              <span
                onClick={this.checkAddData}
                className="close-button"
                style={{
                  fontSize: 14,
                  textDecorationLine: "underline",
                  color: this.state.canAddData ? "black" : "grey",
                }}
              >
                + Add
              </span>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="outline-secondary"
              onClick={() => this.setState({ addModal: false })}
            >
              Close
            </Button>
            <Button variant="success" onClick={() => this.saveChanges()}>
              Save Changes
            </Button>
          </Modal.Footer>
        </Modal>

        <div style={{ textAlign: "center", height: 40, marginTop: 20 }}>
          <div style={{ display: "inline-block" }}>
            <this._renderDropdown />
          </div>
          <div className="_block" style={{}}>
            <this._renderWeekDropdown />
          </div>
          <div className="_block" style={{}}>
            <Button
              className={"add"}
              variant="outline-success"
              title="Add"
              onClick={() => this.setState({ addModal: true })}
            >
              Add
            </Button>
          </div>
        </div>
      </div>
    );
  }
}

export default GeneralListComponent;
