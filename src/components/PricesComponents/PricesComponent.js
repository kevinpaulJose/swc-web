import React from "react";
import { Button, Dropdown, DropdownButton, Table } from "react-bootstrap";
import {
  getPriceByWeek,
  getSetTime,
  getUsersById,
  setPrice,
} from "../../firebase/functions";
import "./prices.css";
import { Dots } from "loading-animations-react";

export default class PricesComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      currentWeek: 1,
      selectedWeek: "Week 1",
      currentPrice: "",
      isPriceSet: false,
      currentPriceID: 0,
      addData: [],
      loading: false,
      saving: false,
    };
  }

  async componentDidMount() {
    await this.getSelectedWeek();
    // await this.refreshData(this.state.selectedWeek);
  }
  refreshData = async (week) => {
    this.setState({ loading: true });
    const data = await getPriceByWeek(week);
    if (data.length > 0) {
      const temp = data[0].users.sort(
        (a, b) =>
          parseInt(a.group.split(" ")[1]) - parseInt(b.group.split(" ")[1])
      );
      this.setState({
        addData: temp,
        loading: false,
        currentPriceID: data[0].userId,
        isPriceSet: true,
        currentPrice: data[0].price,
      });
    } else {
      this.setState({
        addData: [],
        loading: false,
        currentPriceID: 0,
        isPriceSet: false,
        currentPrice: "",
      });
    }
  };
  //   getSelectedWeek = async () => {
  //     let setTime = await getSetTime();
  //     const date1 = setTime;
  //     const date2 = new Date();
  //     const diffTime = Math.abs(date2 - date1);
  //     const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  //     const actualTime = date2 - date1;
  //     const actualDiffDays = Math.ceil(actualTime / (1000 * 60 * 60 * 24));
  //     // alert(actualDiffDays);
  //     if (actualDiffDays > 1) {
  //       this.setState({ canAdd: false });
  //     }
  //     this.setState({
  //       currentWeek: Math.ceil(diffDays / 7),
  //       selectedWeek: "Week " + Math.ceil(diffDays / 7).toString(),
  //     });

  //   };
  getSelectedWeek = async () => {
    let setTime = await getSetTime();
    const date1 = setTime;
    const date2 = new Date();
    const diffTime = Math.abs(date2 - date1);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const actualTime = date2 - date1;
    const actualDiffDays = Math.ceil(actualTime / (1000 * 60 * 60 * 24));
    // alert(actualDiffDays);
    // alert(actualDiffDays);

    const actualWeek = Math.ceil(actualDiffDays / 7);
    // alert(actualWeek);
    if (actualWeek <= 0) {
      this.setState({
        currentWeek: 1,
        selectedWeek: "Week 1",
        addData: [],
        loading: false,
        currentPriceID: 0,
        isPriceSet: true,
        currentPrice: "",
      });
    } else {
      this.setState({
        currentWeek: Math.ceil(diffDays / 7),
        selectedWeek: "Week " + Math.ceil(diffDays / 7).toString(),
      });
      await this.refreshData("Week " + Math.ceil(diffDays / 7).toString());
    }
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
              onClick={() => {
                this.setState({ selectedWeek: value });
                this.refreshData(value);
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
  manageSetPrice = async () => {
    this.setState({ saving: true });
    let allUserWithSameId = await getUsersById(
      parseInt(this.state.currentPriceID)
    );
    let setData = {
      week: this.state.selectedWeek,
      users: allUserWithSameId,
      price: this.state.currentPrice,
      userId: parseInt(this.state.currentPriceID),
    };
    await setPrice("prices", setData, parseInt(this.state.currentPriceID));
    this.setState({ saving: false });
    await this.refreshData(this.state.selectedWeek);
  };

  _displayGroupData = ({ item }) => {
    return (
      <tr key={item.id.toString() + item.name}>
        <td>{item.id}</td>
        <td>{item.name}</td>
        <td>{item.city}</td>
        <td>{item.phone}</td>
        <td>{item.group}</td>
      </tr>
    );
  };

  render() {
    return (
      <div className="  mt-4" id="outerBox">
        <div style={{ textAlign: "center", height: 40, marginTop: 20 }}>
          <div className="_block" style={{}}>
            <this._renderWeekDropdown />
          </div>
          <div className="_block" style={{ justifyContent: "center" }}>
            <input
              placeholder="price"
              className="search"
              type={"text"}
              value={this.state.currentPrice}
              disabled={this.state.isPriceSet}
              onChange={(e) => {
                this.setState({ currentPrice: e.target.value });
                // if (e.target.value.length >= 3) {
                // this.searchData(e.target.value);
                // }
              }}
            />
          </div>
          <div className="_block" style={{ justifyContent: "center" }}>
            <input
              //   style={{ width: "100%" }}
              placeholder="ID"
              className="searchs"
              type={"number"}
              disabled={this.state.isPriceSet}
              value={
                parseInt(this.state.currentPriceID) === 0
                  ? ""
                  : this.state.currentPriceID
              }
              onChange={(e) => {
                this.setState({ currentPriceID: e.target.value });
                // if (e.target.value.length >= 3) {
                // this.searchData(e.target.value);
                // }
              }}
            />
          </div>
          {!this.state.isPriceSet && (
            <div className="_block" style={{}}>
              <Button
                className={"add"}
                variant="outline-success"
                title="Add"
                onClick={() => {
                  if (
                    this.state.currentPriceID === 0 ||
                    this.state.currentPrice.trim() === "" ||
                    this.state.currentPriceID === ""
                  ) {
                    console.log("No Content");
                  } else {
                    this.manageSetPrice();
                  }
                }}
              >
                {this.state.saving ? "Saving..." : "Save"}
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
            <div
              className="Dots"
              style={{ display: "inline-block", width: 100, height: 100 }}
            >
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
            <div
              style={{
                width: "95%",
                marginLeft: "3%",
                overflowY: "auto",
              }}
              className={"mainDataOverflow mt-5"}
            >
              <Table striped bordered hover size="md" className="mainData">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Name</th>
                    <th>City</th>
                    <th>Phone</th>
                    <th>Group</th>
                  </tr>
                </thead>
                <tbody>
                  {this.state.addData.map((value, key) => {
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
