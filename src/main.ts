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




function postRequest(prompt:string) {
  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");

  const raw = JSON.stringify({
    "prompt": prompt
  });

  const requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: raw,
    redirect: "follow" as RequestRedirect
  };

  const API = "aHR0cHM6Ly9hcGkuaW1hZ2VuLml6aWl6ei5jb20vZ2VuZXJhdGU=";

  const apiBuffer = Buffer.from(API, 'base64');
  const apiDecoded = apiBuffer.toString('utf8');

  return fetch(apiDecoded, requestOptions)
    .then((response) => response.text());
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


// on click of submit btn and regenerate btn
document.getElementById('submit')!.addEventListener('click', () => {
  // grab text input
  const prompt = gatherPrompt();
  // trnaition screen
  pageTransition('screen1', 'screen2');
  // dreamy show animation
  document.getElementById('dreamy')!.querySelector('p')!.textContent = prompt;
  document.getElementById('dreamy2')!.querySelector('p')!.textContent = prompt;
  document.getElementById('dreamy-group')!.classList.add('dreamy-group-show');
  generateImage(prompt);
});
// regenerate btn
document.getElementById('regenerate')!.addEventListener('click', () => {
  // undo animation gradient
  sleep(0.2).then(() => {
    document.getElementById('gradient-overlay')!.classList.remove('gradient-overlay-show');
  })
  // grab text input
  const prompt = gatherPrompt();
  // trnaition screen
  pageTransition('screen3', 'screen2');
  // dreamy show animation
  document.getElementById('dreamy')!.querySelector('p')!.textContent = prompt;
  document.getElementById('dreamy2')!.querySelector('p')!.textContent = prompt;
  document.getElementById('dreamy-group')!.classList.add('dreamy-group-show');
  generateImage(prompt);
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
  if (isDevMode == false) {
    console.log('Submitting query...');
    
    // make post request
    postRequest(prompt).then((result) => {
      console.log(result);
      // the result will come out as base64.
      // Make how to convert it to image temporarily to be displayed in HTML.
      const image = document.getElementById('img_output') as HTMLImageElement;
      image.src = `data:image/jpeg;base64,${result}`;
      document.getElementById('dreamy-group')!.classList.remove('dreamy-group-show');
      pageTransition('screen2', 'screen3');
      console.log('Query complete ✅');
    });
  } else if (isDevMode == true) {
    console.warn('!!! DEV MODE !!! Submitting query...');
    sleep(3).then(() => {  // Fake delay for dev mode
      // run dummy request
      const image = document.getElementById('img_output') as HTMLImageElement;
      image.src = `https://c.tenor.com/k1wbOgEPazIAAAAM/the-rock-sus-meme-the-rock-sus.gif`;
      document.getElementById('dreamy-group')!.classList.remove('dreamy-group-show');
      pageTransition('screen2', 'screen3');
      console.log('Query dev mode complete ✅');
    });
  }
}
