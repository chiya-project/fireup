import axios from "axios";

const { data } = await axios.delete("http://localhost:3000/:fileID");

console.log(data);