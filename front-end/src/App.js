import React, { Component } from "react";
import axios from "axios";
import Map from "./components/Map";
import { BrowserRouter, Switch, Route } from "react-router-dom";
import Home from "./components/Home";
import NotFound from "./components/NotFound";
import Chart1 from "./components/BarChart";
import Chart2 from "./components/BarChart2";
import Chart3 from "./components/BarChart3";
import Chart4 from "./components/BarChart4";
import Chart5 from "./components/BarChart5";

import "./App.css";

const initialState = {
  colors: [
    "rgba(5, 155, 247, 0.7)",
    "rgba(233,30,99,0.7)",
    "rgba(53,211,156,0.7)",
    "rgba(257,234,13,0.7)"
  ],
  states_data: [],
  data_loaded: false,
  fields: [
    "sentiment_score",
    "tweet_counts",
    "unemployed_rate",
    "weekly_household_income",
    "average_monthly_mortgage",
    "median_personal_income"
  ],
  query: "sentiment_score",
};
class App extends Component {
  state = initialState;

  componentDidMount() {
    this.fetchStateData();
  }

  fetchStateData = async () => {
    try {
      console.log("Starting to fetch data...");
      const response = await axios({
        method: "get",
        url: "/output_final.json",
        timeout: 5000, // 5 second timeout
      });
      console.log("Raw response received:", response);
      
      if (!response.data) {
        throw new Error("No data received from server");
      }
      
      console.log("Response data type:", typeof response.data);
      console.log("Response data length:", Array.isArray(response.data) ? response.data.length : 'not an array');
      
      const states_data = this.processData(response.data);
      console.log("Data processed successfully. Number of records:", states_data.length);
 
      this.setState({
        states_data,
        data_loaded: true,
      });
    } catch (e) {
      console.error("Error in fetchStateData:", e);
      console.error("Error name:", e.name);
      console.error("Error message:", e.message);
      console.error("Error stack:", e.stack);
      
      // Set error state
      this.setState({
        data_loaded: true,
        error: e.message
      });
    }
  };

  processData = (data) => {
    let processed = [];

    for (const d of data) {
      let obj = {
        sa4_name: d.sa4_name_2016,
        sentiment_score: d.sentiment_score,
        tweet_counts: d.tweet_counts,
        unemployed_rate: d.unemployed_rate,
        median_house_price: d.median_house_price || 0, // Handle missing data
        weekly_household_income: d.equivalised_total_household_income_census_median_weekly,
        average_monthly_mortgage: d.rent_mortgage_payments_census_average_monthly_household_payment,
        median_personal_income: d.median_aud,
        coordinates: d.centroid
      };
      processed.push(obj);
    }

    return processed;
  };


  handleSetQuery = (query) => {
    this.setState({
      query,
    });
  };

  render() {
    const { colors, states_data, data_loaded, fields, query, error } = this.state;

    if (!data_loaded) {
      return (
        <div className="root">
          <div style={{ padding: '20px', textAlign: 'center' }}>
            <h2>Loading data...</h2>
            <p>Please wait while we fetch the data...</p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="root">
          <div style={{ padding: '20px', textAlign: 'center', color: 'red' }}>
            <h2>Error Loading Data</h2>
            <p>Error message: {error}</p>
            <p>Please check if the data file exists in the correct location.</p>
          </div>
        </div>
      );
    }

    if (!states_data || states_data.length === 0) {
      return (
        <div className="root">
          <div style={{ padding: '20px', textAlign: 'center' }}>
            <h2>No data available</h2>
            <p>There was an error loading the data. Please check the console for details.</p>
          </div>
        </div>
      );
    }

    return (
      <div className="root">
        <BrowserRouter>
          <Switch>
            <Route exact path="/">
              <Home />
            </Route>
            <Route exact path="/map">
              <Map
                colors={colors}
                data={states_data}
                fields={fields}
                query={query}
              />
            </Route>
            <Route exact path="/personal_income">
              <Chart1 data={states_data} />
            </Route>
            <Route exact path="/unemployment_rate">
              <Chart2 data={states_data} />
            </Route>
            <Route exact path="/house_price">
              <Chart3 data={states_data} />
            </Route>
            <Route exact path="/average_monthly_morgage">
              <Chart4 data={states_data} />
            </Route>
            <Route exact path="/weekly_household_income">
              <Chart5 data={states_data} />
            </Route>
            <Route component={NotFound} />
          </Switch>
        </BrowserRouter>
      </div>
    );
  }
}

export default App;

/*
REFERENCES

Ansible 2021, Loops, viewed 1st May 2021, 
<https://docs.ansible.com/ansible/latest/user_guide/playbooks_loops.html#iterating-over-a-simple-list>.

Ansible 2021, os_security_group_rule - Add/Delete rule from an existing security group, viewed 1st May 2021, 
<https://docs.ansible.com/ansible/2.5/modules/os_security_group_rule_module.html>.

Ansible 2021, os_server - Create/Delete Compute Instances from Openstack, viewed 25th April 2021, <https://docs.ansible.com/ansible/2.4/os_server_module.html>.

Ansible 2021, Tags, viewed 25th April 2021, 
<https://docs.ansible.com/ansible/latest/user_guide/playbooks_tags.html>.

Apache Software Foundation 2021, 2.2/ Cluster Setup, viewed 1st May 2021,
<https://docs.couchdb.org/en/stable/setup/cluster.html>.

AURIN 2018, comp90024 Code snippets for the Cloud Computing Course, viewed 23 April 2021, <https://github.com/AURIN/comp90024>.

AURIN 2021, Australian Urban Research Infrastructure Network Portal, viewed 11 May 2021, 
<https://portal.aurin.org.au/>.

Australian Bureau of Statistics 2016, Main Structure and Greater Capital City Statistical Areas -  Australian Statistical Geography Standard (ASGS): Volume 1, viewed 8th May 2021,
<https://www.abs.gov.au/ausstats/abs@.nsf/mf/1270.0.55.001>.

Eisenkot, G 2020, Security challenges and risks with infrastructure as code, viewed 21st May 2021,
<https://bridgecrew.io/blog/security-challenges-and-risks-with-infrastructure-as-code/>.

Harrower, M. and Bloch, M., 2006. MapShaper. org: A map generalization web service. IEEE Computer Graphics and Applications, 26(4), pp.22-27.

Internet Assigned Numbers Authority 2021, Service Name and Transport Protocol Port Number Registry, viewed 1st May 2021, <https://www.iana.org/assignments/service-names-port-numbers/service-names-port-numbers.xhtml?search=http>.

JGraph 2021, diagrams.net, viewed 1st April 2021, 
<https://www.diagrams.net>.

Nielsen, FÅ 2017. afinn project, Technical University of Denmark, Kongens Lyngby, viewed 25th April 2021, <http://www2.imm.dtu.dk/pubdb/edoc/imm6975.pdf>.

Pan, A 2021, Workshop 9-10 Ansible, The University of Melbourne, Parkville, viewed 24th April 2021, <https://canvas.lms.unimelb.edu.au/courses/105440/files/7077574/download?download_frd=1>.

Pan, A 2021, Workshop 9-10 Ansible Code, The University of Melbourne, Parkville, viewed 24th April 2021, <https://canvas.lms.unimelb.edu.au/files/7112800/download?download_frd=1>.

The University of Melbourne 2021, Melbourne Research Cloud, viewed 23rd April 2021, <https://dashboard.cloud.unimelb.edu.au/auth/login/>.

The University of Melbourne 2021, Re:Cite, viewed 21st May 2021, 
<https://library.unimelb.edu.au/recite>.

Tinati, R., Halford, S., Carr, L. and Pope, C., 2014. Big data: methodological challenges and approaches for sociological analysis. Sociology, 48(4), pp.663-681. Viewed 21st May 2021,
<https://www.jstor.org/stable/24433725>.

Tutorials Point 2021, YAML - Comments, viewed 1st May 2021, 
<https://www.tutorialspoint.com/yaml/yaml_comments.htm>.

Vasiljevic, S 2020, Infrastructure As Code Demystified: IaC Benefits, Challenges and Best Practices, viewed 21st May 2021, 
<https://superadmins.com/infrastructure-as-code-demystified-iac-benefits-challenges-best-practices/>.
*/