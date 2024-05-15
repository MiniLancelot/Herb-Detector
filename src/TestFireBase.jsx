import {useState } from "react";
import { dataRef } from "./Firebase"; // Ensure this is correctly configured

function TestFireBase() {
    const [name, setName] = useState('');
    const [searchedAltName, setSearchedAltName] = useState("");
    const [searchedSciName, setSearchedSciName] = useState("");

      const handleSearch = () => {
        const plantsRef = dataRef.ref('dataset');
        plantsRef.orderByChild('partused').equalTo(name).once('value', snapshot => {
          const data = snapshot.val();
          if (data) {
            const key = Object.keys(data)[0];
            setSearchedAltName(data[key].alternativename);
            setSearchedSciName(data[key].sciencename);
          } else {
            setSearchedAltName("No plant found with this name");
            setSearchedSciName("");
          }
        });
      };

    return (
        <div>
          <input value={name} onChange={(e) => setName(e.target.value)} />
          <button onClick={handleSearch}>Search</button>
          <div>
            <h6>Alternative Name: {searchedAltName}</h6>
            <h6>Scientific Name: {searchedSciName}</h6>
          </div>
        </div>
      );
}

export default TestFireBase;
