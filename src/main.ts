import './style.scss'
import $ from 'jquery';
import date from 'date-and-time';


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
function pageTransition(oldpage:string, newpage:string, prompt: string = '') {
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

  // globally set dreamy text to prompt
  document.getElementById('dreamy')!.querySelector('p')!.textContent = prompt;
  document.getElementById('dreamy2')!.querySelector('p')!.textContent = prompt;

  if (oldpage === 'screen1' && newpage === 'screen2') {
    document.getElementById('dreamy-group')!.classList.add('dreamy-group-show');
  } else if (oldpage === 'screen2' && newpage === 'screen3') {
    document.getElementById('dreamy-group')!.classList.remove('dreamy-group-show');
  }
}



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



// on click of submit btn
document.getElementById('submit')!.addEventListener('click', async () => {
  
  // grab text input and radioID
  const prompt = (document.querySelector('textarea') as HTMLTextAreaElement).value;
  const radioID = (document.querySelector<HTMLInputElement>('input[name="group"]:checked'))?.id;
  let settings; let url;

  // radio selection logic
  if (radioID === 'FLUXX') {
    console.log('Selected FLUXX');
    url = "https://api-imagen.ai.iziizz.com/flux-generate";
  } else if (radioID === 'REALX') {
    console.log('Selected REALX');
    url = "https://api-imagen.ai.iziizz.com/flux-realism-generate";
  }

  // make a POST request to the server
  settings = {
    "url": url,
    "method": "POST",
    "timeout": 0,
    "headers": {
      "Content-Type": "application/json"
    },
    "data": JSON.stringify({
      "prompt": prompt
    }),
  };

  // transition screen
  pageTransition('screen1', 'screen2', prompt);
  
  $.ajax(settings).done(function (response) {
    
    // when done, transition to screen 3
    pageTransition('screen2', 'screen3');
    console.log(response);
    
    // response is in JSON. Get just the base64 string.
    const result = response.image_base64[0][0];

    // replace the image src with the base64 image
    const image = document.getElementById('img_output') as HTMLImageElement;
    image.src = `data:image/jpeg;base64,${result}`;
  });
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