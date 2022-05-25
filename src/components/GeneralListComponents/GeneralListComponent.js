import React from "react";
import {
  Button,
  Dropdown,
  DropdownButton,
  Form,
  Modal,
  Table,
  ToggleButton,
} from "react-bootstrap";
import {
  getSetTime,
  getUsersByGroup,
  removeData,
  setData,
  updateData,
} from "../../firebase/functions";
import Papa from "papaparse";
import "./general.css";
import { Dots } from "loading-animations-react";

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
      newData: [],
      name: "",
      city: "",
      phone: "",
      error: false,
      selectedWeek: "Week 1",
      currentWeek: 1,
      saving: false,
      loading: false,
      selectedData: [],
      limit: 20,
      selectAll: false,
      searchText: "",
      searchData: [],
      unpaidFilter: false,
      deleting: false,
      deleteModal: false,
      unpaidLoading: false,
      paidLoading: false,
      canAdd: true,
    };
  }
  async componentDidMount() {
    this.getSelectedWeek();
    await this.refreshData("Group 1");
  }

  refreshData = async (grp) => {
    this.setState({ loading: true });
    const data = await getUsersByGroup(grp);
    this.setState({
      addData: data,
      loading: false,
      searchData: data,
      selectedData: [],
    });
  };

  getSelectedWeek = async () => {
    let setTime = await getSetTime();
    const date1 = setTime;
    const date2 = new Date();
    const diffTime = Math.abs(date2 - date1);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const actualTime = date2 - date1;
    const actualDiffDays = Math.ceil(actualTime / (1000 * 60 * 60 * 24));
    // alert(actualDiffDays);
    if (actualDiffDays > 1) {
      this.setState({ canAdd: false });
    }
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
      id: "",
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
      // console.log(defaultPayment);
      let temp = {
        id: parseInt(this.state.id),
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
    let done = await setData(this.state.newData, "users");

    if (done) {
      this.setState({ newData: [], addModal: false, saving: false });
    } else if (!done) {
      console.log("Error occured");
    }
    await this.refreshData(this.state.selected);
  };
  showUnpaid = () => {
    const unPaid = this.state.searchData.filter(
      (v) => !v.payment[this.state.selectedWeek]
    );
    this.setState({ searchData: unPaid });
  };
  showAll = () => {
    this.setState({ searchData: this.state.addData });
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
  searchData = (txt) => {
    const searchData = this.state.addData.filter((v) =>
      v.name.toLowerCase().includes(txt.toLowerCase())
    );
    this.setState({ searchData: searchData });
  };

  addSelectedData = (data) => {
    let retData = this.state.selectedData;
    retData.push(data);
    this.setState({ selectedData: retData });
    // console.log(retData);
  };
  removeSlectedData = (data) => {
    let retData = this.state.selectedData.filter((v, i) => v.id !== data.id);
    this.setState({ selectedData: retData });
    // console.log(retData);
  };

  manageSelectedData = (data) => {
    let retData = this.state.selectedData.filter((v, i) => v.id === data.id);
    if (retData.length > 0) {
      this.removeSlectedData(data);
    } else {
      this.addSelectedData(data);
    }
  };
  removeSelected = async () => {
    this.setState({ deleting: true });
    const status = await removeData(
      this.state.selectedData,
      this.state.selected,
      "archived"
    );
    if (status) {
      this.setState({
        deleting: false,
        loading: true,
        selectedData: [],
        unpaidFilter: false,
      });
      await this.refreshData(this.state.selected);
      this.setState({
        selectedData: [],
        unpaidFilter: false,
      });
    } else {
      alert("Failed Deleting");
    }
  };
  manageSelectAllData = () => {
    if (this.state.selectAll) {
      this.setState({ selectedData: [], selectAll: false });
    } else {
      this.setState({ selectedData: this.state.searchData, selectAll: true });
    }
  };
  manageUnpaidFilter = () => {
    if (!this.state.unpaidFilter) {
      this.setState({ unpaidFilter: true });
      this.showUnpaid();
    } else {
      this.setState({ unpaidFilter: false });
      this.showAll();
    }
  };
  manageUnpaid = async () => {
    this.setState({ unpaidLoading: true });
    let tempArr = this.state.selectedData;
    let unpaidArray = [];
    tempArr.forEach((v, i) => {
      v.payment[this.state.selectedWeek] = false;
      unpaidArray.push(v);
    });
    const res = await updateData(unpaidArray, this.state.selected);
    console.log(res);
    if (res) {
      this.setState({ unpaidLoading: false });
      await this.refreshData(this.state.selected);
    }
  };
  managePaid = async () => {
    this.setState({ paidLoading: true });
    let tempArr = this.state.selectedData;
    let paidArray = [];
    tempArr.forEach((v, i) => {
      v.payment[this.state.selectedWeek] = true;
      paidArray.push(v);
    });
    const res = await updateData(paidArray, this.state.selected);
    console.log(res);
    if (res) {
      this.setState({ paidLoading: false });
      await this.refreshData(this.state.selected);
    }
  };

  _renderCVReader = () => {
    return (
      <div>
        <input
          type="file"
          name="file"
          accept=".csv"
          // style={{ display: "inline-block", margin: "10px auto", width: 50 }}
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
            <Dropdown.Item
              onClick={async () => {
                this.setState({ selected: value });
                await this.refreshData(value);
              }}
            >
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
  _displayGroupData = ({ item }) => {
    return (
      <tr
        style={{
          backgroundColor: !item.payment[this.state.selectedWeek]
            ? "#faa7a7"
            : "",
        }}
        key={item.id.toString() + item.name}
      >
        <td>{item.id}</td>
        <td>{item.name}</td>
        <td>{item.city}</td>
        <td>{item.phone}</td>
        <td colSpan={2} style={{ textAlign: "center" }}>
          <input
            onClick={() => {
              this.manageSelectedData(item);
            }}
            checked={this.state.selectedData.indexOf(item) !== -1}
            className="close-button"
            type="checkbox"
          ></input>
        </td>
      </tr>
    );
  };
  _displayBlankInput = () => {
    return (
      <tr>
        <td>
          <Form.Control
            type="number"
            value={this.state.id}
            onChange={(e) => {
              this.setState({ id: e.target.value });
            }}
            placeholder="id"
          />
        </td>
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
      <div className="  mt-4" id="outerBox">
        <Modal show={this.state.deleteModal}>
          <Modal.Header>
            <Modal.Title>
              <span>Alert</span>
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div>
              <span>
                Are you sure you want to remove{" "}
                <b>{this.state.selectedData.length}</b> entries?
              </span>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="outline-secondary"
              onClick={() => this.setState({ deleteModal: false })}
            >
              Cancel
            </Button>
            <Button
              disabled={this.state.saving}
              variant="danger"
              onClick={() => {
                this.removeSelected();
                this.setState({ deleteModal: false });
              }}
            >
              Remove
            </Button>
          </Modal.Footer>
        </Modal>
        <Modal show={this.state.addModal}>
          <Modal.Header>
            <Modal.Title>
              <span>Add in {this.state.selected}</span>
              {/* <CSVReaderComponent /> */}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <this._renderCVReader />
            <div style={{}}>
              <div
                style={{
                  width: "100%",
                  overflowY: "auto",
                }}
                className={"modalDataOverflow"}
              >
                <Table striped bordered hover size="sm">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Name</th>
                      <th>City</th>
                      <th>Phone</th>
                      <th
                        onClick={() => this.setState({ newData: [] })}
                        colSpan={2}
                        style={{ cursor: "pointer", textAlign: "center" }}
                      >
                        X
                      </th>
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
              </div>
            </div>

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
              onClick={() => this.setState({ addModal: false, newData: [] })}
            >
              Close
            </Button>
            <Button
              disabled={this.state.saving}
              variant="success"
              onClick={() => this.saveChanges()}
            >
              {this.state.saving ? "Saving..." : "Save Changes"}
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

          <div className="_block" style={{ justifyContent: "center" }}>
            <input
              placeholder="Search"
              className="search"
              type={"text"}
              value={this.state.searchText}
              onChange={(e) => {
                this.setState({ searchText: e.target.value });
                // if (e.target.value.length >= 3) {
                this.searchData(e.target.value);
                // }
              }}
            />
          </div>

          {this.state.canAdd && (
            <div className="_block" style={{}}>
              <Button
                className={"add"}
                variant="outline-success"
                title="Add"
                onClick={() => this.setState({ addModal: true })}
                disabled={!this.state.canAdd}
              >
                Add
              </Button>
            </div>
          )}
        </div>
        {this.state.loading && (
          <div
            style={{
              width: "100%",
              height: 60,
              color: "white",
              textAlign: "center",
              marginTop: 30,
            }}
          >
            <div style={{ display: "inline-block", width: 100, height: 100 }}>
              <Dots
                dotColors={[
                  "#4285F4",
                  "#DB4437",
                  "#F4B400",
                  "#123abc",
                  "#0F9D58",
                  "#4285F4",
                ]}
              />
            </div>
          </div>
        )}

        {!this.state.loading && this.state.addData.length > 0 && (
          <>
            <div className="toggleBtn">
              <ToggleButton
                id="toggle-check"
                type="checkbox"
                variant={
                  this.state.unpaidFilter ? "danger" : "outline-secondary"
                }
                checked={this.state.unpaidFilter}
                value="1"
                className="stickyComp1 mb-3"
                onChange={(e) => this.manageUnpaidFilter()}
              >
                Display only unpaid
              </ToggleButton>
              {this.state.selectedData.length > 0 && (
                <Button
                  id="toggle-check"
                  variant="outline-success"
                  checked={this.state.unpaidFilter}
                  value="1"
                  className="stickyComp1 mb-3 "
                  style={{ marginLeft: 10 }}
                  onClick={() => this.managePaid()}
                  disabled={this.state.paidLoading}
                >
                  {this.state.paidLoading ? "Loading..." : "Mark as paid"}
                </Button>
              )}
              {this.state.selectedData.length > 0 && (
                <Button
                  id="toggle-check"
                  variant="outline-danger"
                  checked={this.state.unpaidFilter}
                  value="1"
                  className="stickyComp1 mb-3 "
                  style={{ marginLeft: 10 }}
                  onClick={() => this.manageUnpaid()}
                  disabled={this.state.unpaidLoading}
                >
                  {this.state.unpaidLoading ? "Loading..." : "Mark as unpaid"}
                </Button>
              )}
              {this.state.selectedData.length > 0 && (
                <Button
                  id="toggle-check"
                  variant="danger"
                  checked={this.state.unpaidFilter}
                  value="1"
                  className="stickyComp1 mb-3 "
                  style={{ marginLeft: 10 }}
                  onClick={() => this.setState({ deleteModal: true })}
                  disabled={this.state.deleting}
                >
                  {this.state.deleting ? "Deleting..." : "Remove Selected"}
                </Button>
              )}
            </div>

            <div
              style={{
                width: "95%",
                marginLeft: "3%",
                overflowY: "auto",
              }}
              className={"mainDataOverflow"}
            >
              <Table striped bordered hover size="md" className="mainData">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Name</th>
                    <th>City</th>
                    <th>Phone</th>
                    {/* <th colSpan={2}> */}
                    <td colSpan={2} style={{ textAlign: "center" }}>
                      <input
                        onClick={() => {
                          this.manageSelectAllData();
                          // console.log(this.state.addData);
                        }}
                        checked={
                          this.state.selectAll &&
                          this.state.selectedData.length > 0
                        }
                        className="close-button"
                        type="checkbox"
                      ></input>
                    </td>
                    {/* </th> */}
                  </tr>
                </thead>
                <tbody>
                  {this.state.searchData.map((value, key) => {
                    return <this._displayGroupData item={value} />;
                  })}
                </tbody>
              </Table>
            </div>
          </>
        )}
      </div>
    );
  }
}

export default GeneralListComponent;
