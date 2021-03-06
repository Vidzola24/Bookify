// Importing hooks and Libraries
import React from 'react';
import { useState, useEffect } from "react";
import axios from "axios";
import IncExNavbar from "./IncExNavbar";
import { Paper } from "@material-ui/core";
import Carousel from 'react-material-ui-carousel'
import "react-alice-carousel/lib/alice-carousel.css";

//======================= this part generates options for past 36 months for dropdown menu =========================
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const currentDate = new Date();
let currentYear = currentDate.getFullYear();
let currentMonth = currentDate.getMonth();

const options = [
  {
    key: 0,
    label: "Everything",
    queryDate: { starts: new Date(0).toISOString().substr(0, 10), ends: currentDate.toISOString().substr(0, 10) }
  }
];

const ends_temp = currentDate.toISOString().substr(0, 10);
currentDate.setDate(1);

options.push(
  {
    key: 1,
    label: `${MONTHS[currentMonth]} ${currentYear}`,
    queryDate: { starts: currentDate.toISOString().substr(0, 10), ends: ends_temp }
  }
)

for(let i = 2; i < 38; i++) {
  let newOption = {};
  newOption.key = i;
  newOption.queryDate = {}
  newOption.queryDate.ends = currentDate.toISOString().substr(0, 10);

  currentMonth--;
  if(currentMonth < 0) {
    currentMonth = 11;
    currentYear--;
  }
  currentDate.setMonth(currentMonth);
  currentDate.setFullYear(currentYear);
  newOption.queryDate.starts = currentDate.toISOString().substr(0, 10);

  newOption.label = `${MONTHS[currentMonth]} ${currentYear}`;

  options.push(newOption);
}

export default function Receipts({logoutCallback}) {
  const [state, setState] = useState({
    queryDate: options[0].queryDate,
    receipts: []
  });

  const onChange = function(value) {
    setState( {...state, queryDate: value[0].queryDate } );
  }

  useEffect(() => {
    axios
      .get("/api/receipt/", { params: { starts: state.queryDate.starts, ends: state.queryDate.ends} })
      .then((res) => setState((prev) => ({ ...prev, receipts: res.data })))
      .catch(() => setState((prev) => ({ ...prev, receipts: [] })));
  }, [state.queryDate]);

  return (
    <section className="not_sidebar receipts">
      <IncExNavbar type={"Receipts"}
        options={options}
        onChange={onChange}
        logoutCallback={logoutCallback}/>
      <Paper elevation={2} style={{borderRadius:'20px', margin:'0 40px 0 40px', height:'70vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center'}}>
        <div className="carouselWrapper" style={{width: '60vw'}}>
        { state.receipts.length === 0 ? <div style={{fontSize:'48px', display:'flex', justifyContent:'center'}}>No receipts available!</div> : <Carousel
          autoPlay={false}
          navButtonsAlwaysVisible={true}
          animation={'slide'}
        >
        {state.receipts.map(receipt => (
          <React.Fragment key={receipt._id}>
            <div style={{display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center'}}>
              <div style={{marginBottom:'20px'}}>Receipt ID #{receipt._id}</div>
              <img src={receipt.data} alt="captured-img" style={{marginBottom:'20px'}}/>
              <div className='regularFont' style={{marginBottom:'20px'}}>{receipt.dateCaptured && "Issued on"} {receipt.dateCaptured?.substr(0, 10)}</div>
            </div>
          </React.Fragment>
          ))}
        </Carousel> }
        </div>
      </Paper>
    </section>
  );
}