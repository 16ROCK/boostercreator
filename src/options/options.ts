const profitColumnCheckboxId = 'profit-column';

function save_options(event: SubmitEvent) {
  event.preventDefault();
  const displayProfitNewValue = (event.target as HTMLFormElement)[
    profitColumnCheckboxId
  ].checked;

  console.log(event, 'event');
  console.log(displayProfitNewValue);

  chrome.storage.sync.set(
    {
      displayProfitValue: displayProfitNewValue
    },
    function () {
      var status = document.getElementById('status');

      status!.textContent = 'Options saved.';
      setTimeout(function () {
        status!.textContent = '';
      }, 750);
    }
  );
}

function restore_options() {
  chrome.storage.sync.get(
    {
      displayProfitValue: false
    },
    function (items) {
      (
        document.getElementById(profitColumnCheckboxId)! as HTMLInputElement
      ).checked = items.displayProfitValue;
    }
  );
}

document.addEventListener('DOMContentLoaded', restore_options);
const form = document.getElementById('bodyWrapper');
form!.addEventListener('submit', save_options);
