import './style.scss'
import $ from 'jquery';
import date from 'date-and-time';
import { Buffer } from 'buffer';


// ELIMINATING FOUC
$( document ).ready(function() {
  console.log( "ready!" );
  document.body.style.visibility = 'visible';
});


function sleep(seconds: number) {
  return new Promise(resolve => setTimeout(resolve, seconds * 1000));
}




/**
 * Animates a page transition between the two given pages.
 *
 * @param oldpage the id of the page that is currently being shown
 * @param newpage the id of the page that should be shown
 */
function pageTransition(oldpage:string, newpage:string) {
  document.getElementById(oldpage)!.classList.add('anim-exit');
  sleep(0.2).then(() => {
    document.getElementById(oldpage)!.classList.remove('anim-block-show', 'anim-show', 'anim-exit');
    document.getElementById(newpage)!.classList.add('anim-block-show');
    sleep(0.05).then(() => {
      document.getElementById(newpage)!.classList.add('anim-show');
      if (newpage === 'screen3') {
        document.getElementById('gradient-overlay')!.classList.add('gradient-overlay-show');
      }
    });
  });
}




async function fetchWithTimeout(resource:string, options: {timeout?: number} = {}) {
  const { timeout: timeoutSeconds } = options;
  const timeout = timeoutSeconds ? timeoutSeconds * 1000 : undefined;
  
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  const response = await fetch(resource, {
    ...options,
    signal: controller.signal  
  });
  clearTimeout(id);

  return response;
}



function postRequest(prompt:string) {
  
  var radioID = getSelectedRadioId()
  console.log("Selected " + radioID)
  let API: string;

  function internalPOST(API:string) {
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    const raw = JSON.stringify({ "prompt": prompt });
    const requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: raw,
      redirect: "follow" as RequestRedirect,
    };
    const apiBuffer = Buffer.from(API, 'base64');
    const apiDecoded = apiBuffer.toString('utf8');
    
    return fetchWithTimeout(apiDecoded, { timeout: 120, ...requestOptions }) // timeout in second(s)
      .then((response) => response.text());
  }

  if (radioID === 'FLUXX') {
    API = "aHR0cHM6Ly9hcGktaW1hZ2VuLmFpLml6aWl6ei5jb20vZmx1eC1nZW5lcmF0ZQ==";
    return internalPOST(API);
  } else if (radioID === 'IMGFX') {
    API = "aHR0cHM6Ly9hcGktaW1hZ2VuLmFpLml6aWl6ei5jb20vaW1hZ2VmeC1nZW5lcmF0ZQ=="
    return internalPOST(API);
  } else if (radioID === 'ERROR') {
    API = ""
    return internalPOST(API);
  }
  
};


// when input is filled, remove button disabled attribute
document.querySelector('textarea')!.addEventListener('input', (e) => {
  const inputField = e.target as HTMLTextAreaElement;
  if (inputField.value) {
    document.getElementById('submit')!.removeAttribute('disabled');
  } else {
    document.getElementById('submit')!.setAttribute('disabled', '');
  }
});






// on content load
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('screen1')!.classList.add('anim-block-show');
  sleep(0.5).then(() => {
    document.getElementById('screen1')!.classList.add('anim-show'); 
  });
});







// init value
let count_total: {"count": number, "total": number} = { count: 0, total: 0 };
let response: Promise<{image_base64: string[]; total: number;}> | undefined;



// on click of submit btn
document.getElementById('submit')!.addEventListener('click', async () => {
  
  try {
    // grab text input
    const prompt = gatherPrompt();
    // transition screen
    pageTransition('screen1', 'screen2');
    // dreamy show animation
    document.getElementById('dreamy')!.querySelector('p')!.textContent = prompt;
    document.getElementById('dreamy2')!.querySelector('p')!.textContent = prompt;
    document.getElementById('dreamy-group')!.classList.add('dreamy-group-show');
    
    // generated image return json object (this also make calls to the API, therefore generating new one)
    response = generateImage(prompt)
    // have to wait if response contains content, then proceed to load and show image
    if (response) {
      // store image count
      count_total.count = 0;
      count_total.total = (await response)?.total;
  
      // grab image element and change src
      const image = document.getElementById('img_output') as HTMLImageElement;
      image.src = `data:image/jpeg;base64,${(await response)?.image_base64[count_total.count]}`;
      // grab total images and replace content of regenerate btn
      document.getElementById('regenerate')!.querySelector('span')!.textContent = `Regenerate (${count_total.count+1}/${count_total.total})`;
      // remove dreamy group and transition to screen 3
      document.getElementById('dreamy-group')!.classList.remove('dreamy-group-show');
      pageTransition('screen2', 'screen3');
      console.log(`Showing photo ${count_total.count+1}/${count_total.total} ✅`);
    }
  
  } catch (error) {
    document.getElementById('screen-err')!.querySelector('code')!.textContent += error!.toString();
    document.getElementById('dreamy-group')!.classList.remove('dreamy-group-show');
    pageTransition('screen2', 'screen-err');
  }
  
});


////////////////////////////////
// on click of regenerate btn //
////////////////////////////////
document.getElementById('regenerate')!.addEventListener('click', async () => {
  
  // undo animation gradient
  sleep(0.2).then(() => { document.getElementById('gradient-overlay')!.classList.remove('gradient-overlay-show'); })
  // grab text input
  const prompt = gatherPrompt();
  // transition screen from screen 3 to screen 2
  pageTransition('screen3', 'screen2');
  // dreamy show animation
  document.getElementById('dreamy')!.querySelector('p')!.textContent = prompt;
  document.getElementById('dreamy2')!.querySelector('p')!.textContent = prompt;
  document.getElementById('dreamy-group')!.classList.add('dreamy-group-show');
  
  
  // condition for count_total
  count_total.count++;
  if (count_total.count < count_total.total) {
    sleep(1).then(async () => {
      // grab image element and change src
      const image = document.getElementById('img_output') as HTMLImageElement;
      image.src = `data:image/jpeg;base64,${(await response)?.image_base64[count_total.count]}`;
      // grab total images and replace content of regenerate btn
      document.getElementById('regenerate')!.querySelector('span')!.textContent = `Regenerate (${count_total.count+1}/${count_total.total})`;
      // remove dreamy group and transition to screen 3
      document.getElementById('dreamy-group')!.classList.remove('dreamy-group-show');
      pageTransition('screen2', 'screen3');
      console.log(`Showing photo ${count_total.count+1}/${count_total.total} ✅`);
    })
  } else {
    try {
      // grab text input
      const prompt = gatherPrompt();
      // transition screen
      pageTransition('screen3', 'screen2');
      // dreamy show animation
      document.getElementById('dreamy')!.querySelector('p')!.textContent = prompt;
      document.getElementById('dreamy2')!.querySelector('p')!.textContent = prompt;
      document.getElementById('dreamy-group')!.classList.add('dreamy-group-show');
      
      // generated image return json object (this also make calls to the API, therefore generating new one)
      response = generateImage(prompt)
      // have to wait if response contains content, then proceed to load and show image
      if (response) {
        // store image count
        count_total.count = 0;
        count_total.total = (await response)?.total;
    
        // grab image element and change src
        const image = document.getElementById('img_output') as HTMLImageElement;
        image.src = `data:image/jpeg;base64,${(await response)?.image_base64[count_total.count]}`;
        // grab total images and replace content of regenerate btn
        document.getElementById('regenerate')!.querySelector('span')!.textContent = `Regenerate (${count_total.count+1}/${count_total.total})`;
        // remove dreamy group and transition to screen 3
        document.getElementById('dreamy-group')!.classList.remove('dreamy-group-show');
        pageTransition('screen2', 'screen3');
        console.log(`Showing photo ${count_total.count+1}/${count_total.total} ✅`);
      }
    
    } catch (error) {
      document.getElementById('screen-err')!.querySelector('code')!.textContent += error!.toString();
      document.getElementById('dreamy-group')!.classList.remove('dreamy-group-show');
      pageTransition('screen2', 'screen-err');
    }
  }
});









// on click of download btn id download, download the image file
document.getElementById('download')!.addEventListener('click', () => {
  const image = document.getElementById('img_output') as HTMLImageElement;
  const link = document.createElement('a');
  link.href = image.src;
  // Get the current date and time
  const now = new Date();
  // Format the date and time to "YYYYMMDD_HHMMSS"
  const formattedDate = date.format(now, 'YYYYMMDD_HHMMSS');
  link.download = `IMGEN_${formattedDate}.jpg`;
  link.click();
});

// on click of adjust prompt btn id adjust-prompt
document.getElementById('adjust-prompt')!.addEventListener('click', () => {
  document.getElementById('gradient-overlay')!.classList.remove('gradient-overlay-show');
  pageTransition('screen3', 'screen1');
});




function gatherPrompt() {
  const inputField = document.querySelector('textarea') as HTMLTextAreaElement;
  const prompt = inputField.value;
  console.log("Prompt: " + prompt);
  return prompt;
}

function generateImage(prompt: string) {
  // check for chcekbox ticked or not
  const devModeCheckbox = document.getElementById('devmode') as HTMLInputElement;
  const isDevMode = devModeCheckbox.checked;
  try {
    if (isDevMode == false) {
      console.log('Submitting query...');
      
      // make post request
      return postRequest(prompt)?.then((result) => {
        console.log(result);
        // the result will come out as json string.
        // Make how to convert it to json object to be displayed in HTML.
        const jsonObject = JSON.parse(result) as { 
          image_base64: string[], 
          total: number 
        };
        return jsonObject;
      });
  
    } else if (isDevMode == true) {
      console.warn('!!! DEV MODE !!! Submitting query...');
      var radioID = getSelectedRadioId()
      console.warn("!!! DEV MODE !!! Selected " + radioID)
      sleep(3).then(() => {  // Fake delay for dev mode
        // run dummy request
        const image = document.getElementById('img_output') as HTMLImageElement;
        image.src = `https://c.tenor.com/k1wbOgEPazIAAAAM/the-rock-sus-meme-the-rock-sus.gif`;
        document.getElementById('dreamy-group')!.classList.remove('dreamy-group-show');
        pageTransition('screen2', 'screen3');
        // grab total images and replace content of regenerate btn
        document.getElementById('regenerate')!.querySelector('span')!.textContent = `Regenerate (69/420)`;
        console.log('Query dev mode complete ✅');
      });
    }
  } catch (error) {
    throw error;
  }
}






function getSelectedRadioId(): string | undefined {
  const selectedRadio = document.querySelector<HTMLInputElement>('input[name="group"]:checked');
  if (selectedRadio) {
    return selectedRadio.id;
  }
}


      // const image = document.getElementById('img_output') as HTMLImageElement;
      // image.src = `data:image/jpeg;base64,${result}`;
      // document.getElementById('dreamy-group')!.classList.remove('dreamy-group-show');
      // pageTransition('screen2', 'screen3');
      // console.log('Query complete ✅');