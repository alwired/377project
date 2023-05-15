function getAggregated(data, year) {
    let majorDiff = new Map();
    let majorSeats = new Map();
    data.forEach((section) => {
        if (section['semester'].slice(0, 4) == String(year)) {
            const major = section['course'].slice(0, 4);
            const diff = parseInt(section['open_seats']) - parseInt(section['waitlist']);
            const seats = parseInt(section['seats']);
            if (!majorDiff.has(major)) {
                majorDiff.set(major, 0);
                majorSeats.set(major, 0);
            }
            const oldDiff = majorDiff.get(major);
            const oldSeats = majorSeats.get(major);
            majorDiff.set(major, diff + oldDiff);
            majorSeats.set(major, seats + oldSeats);
        }
    })
    return [majorDiff, majorSeats];
}

async function main(){
    const dropdownButton = document.querySelector('#dd_container');
    const dropdownItems = document.querySelectorAll('.dropdown-item');
    const generate = document.querySelector('#generate');
    const localData = localStorage.getItem('localData');
    let year = 0;
    
    // console.log(localData);

    let data = JSON.parse(localData);
    
    // click menu
    dropdownButton.addEventListener('click', async (event) => {
        event.stopPropagation();
        console.log('clicked dropdown');
        dropdownButton.classList.toggle('is-active')
    })

    // click screen
    document.addEventListener('click', async (event) => {
        event.stopPropagation();
        console.log('clicked screen');
        dropdownButton.classList.remove('is-active')
    })

    // hover items
    dropdownItems.forEach((item) => {
        item.addEventListener('mouseover', async (event) => {
            item.classList.add('is-active');
        })
        item.addEventListener('mouseout', async (event) => {
            item.classList.remove('is-active');
        })
    })

    // click item
    dropdownItems.forEach((item) => {
        item.addEventListener('click', async (event) => {
            event.stopPropagation();
            console.log('clicked' + event.target.id);
            document.querySelector('#year').textContent = event.target.id + "\u00A0\u00A0▼";
            dropdownButton.classList.remove('is-active');
            year = event.target.id;
        })
    })

    // load & display
    generate.addEventListener('click', async (event) => {
        if (localStorage.length > 0) {
            console.log("existing data")
            // console.log(localData)
        }
        console.log(year);
        if (localStorage.length == 0) {
            localStorage.setItem('localData', '[]');
            console.log("fetching and combining")
            for (let page = 1; page < 1; page++) {
                const res = await fetch("https://api.umd.io/v1/courses/sections?per_page=100&page=" + page);
                const res_json = await res.json();
                // console.log('parts:')
                // console.log(localStorage.getItem('localData'))
                // console.log(res_json);

                const new_localData = JSON.parse(localStorage.getItem('localData')).concat(res_json);
                localStorage.setItem('localData', JSON.stringify(new_localData));
            }
            console.log("fetched all data");
            // console.log(localStorage.getItem('localData'))
        }
        
        // console.log(localData);
        
        // console.log(res_json)
        
        data = JSON.parse(localData);
        
        // getAggregated(data, year);

    })


}

document.addEventListener('DOMContentLoaded', async () => main()); 

//todo: hide generate
// why refresh change localdata?