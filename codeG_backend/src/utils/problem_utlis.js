const axios = require('axios');

let language_number= (lang) =>{
    let language={
        "c++":54,
        "javascript":102,
        "java":91,
        "python":109
    }

    return language[lang.toLowerCase()];
}

let submit_batch=async (submissions)=>{
const options = {
  method: 'POST',
  url: 'https://judge0-ce.p.rapidapi.com/submissions/batch',
  params: { 
    base64_encoded: 'false'
  },
  headers: {
    'x-rapidapi-key': process.env.judge0_key,
    'x-rapidapi-host': 'judge0-ce.p.rapidapi.com',
    'Content-Type': 'application/json'
  },
  data: {
    submissions
  }
};

async function fetchData() {
	try {
		const response = await axios.request(options);
		return response.data
	} catch (error) {
		console.error(error);
	}
}

return await fetchData();
}


async function waiting(val){
    setTimeout(()=>{
          return 1
    },val)
}


let submit_token=async (token_array)=>{
const options = {
  method: 'GET',
  url: 'https://judge0-ce.p.rapidapi.com/submissions/batch',
  params: {
    tokens: token_array.join(","),
    base64_encoded: 'false',
    fields: '*'
  },
  headers: {
    'x-rapidapi-key': process.env.judge0_key,
    'x-rapidapi-host': 'judge0-ce.p.rapidapi.com'
  }
};

async function fetchData() {
	try {
		const response = await axios.request(options);
		return response.data
	} catch (error) {
		console.error(error);
	}
}


while(1){
let result=await fetchData();



let all_testcase_result=result.submissions.every((k)=>k.status_id>2)

if(all_testcase_result){
    return result.submissions
}

await waiting(1000)
}

}


module.exports={language_number,submit_batch,submit_token}
