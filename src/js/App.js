import React, { useEffect, useState } from 'react';
import Power from './components/Power';
import Item from './components/Item';
import { initialValues } from './initialValues';
import ItemShop from './components/ItemShop';

const App = () => {
  // eslint-disable-next-line
  const [data, setData] = useState(initialValues);
  // eslint-disable-next-line
  const [armoryData, setArmoryData] = useState(null);

  useEffect(() => {
    const getData = async () => {
      const response = await fetch('data.json');
      const data = await response.json();
      setArmoryData(data);
      console.log('test', data);
    };
    getData();
  }, []);

  return (
    <div className="container">
      <div className="row">
        <div className="col-12 mb-3">
          <h4>Overwatch 2 Stadium Build Planner</h4>
        </div>
      </div>
      <div className="row armory">
        <div className="col-4 bordered build-section">
          <p className="build-section--title">Build Cost: ${data.buildCost}</p>
          <section className="container">
            <section className="row">
              <p className="col text-align-center"><b>Powers</b></p>
            </section>
            <section className="row">
              <section className="col-3 build-section--powers">
                <Power />
                <p className="power-block--title">Round 1</p>
              </section>
              <section className="col-3 build-section--powers">
                <Power />
                <p className="power-block--title">Round 3</p>
              </section>
              <section className="col-3 build-section--powers">
                <Power />
                <p className="power-block--title">Round 5</p>
              </section>
              <section className="col-3 build-section--powers">
                <Power />
                <p className="power-block--title">Round 7</p>
              </section>
            </section>

            <section className="row mt-3">
              <p className="col text-align-center"><b>Items</b></p>
            </section>
            <section className="row justify-content-center">
              <section className="col-4 build-section--items">
                <Item />
              </section>
              <section className="col-4 build-section--items">
                <Item />
              </section>
              <section className="col-4 build-section--items">
                <Item />
              </section>
              <section className="col-4 build-section--items">
                <Item />
              </section>
              <section className="col-4 build-section--items">
                <Item />
              </section>
              <section className="col-4 build-section--items">
                <Item />
              </section>
            </section>
          </section>
        </div>
        <div className="ms-4 col bordered px-0">
          {armoryData && <ItemShop data={armoryData} />}
        </div>
      </div>
    </div>
  );
};

export default App;
