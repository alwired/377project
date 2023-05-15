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


function getExtremes(map, reverse) {
    let sorted;
    if (!reverse) {
        sorted = new Map([...map.entries()].sort((a, b) => b[1] - a[1]));
    } else {
        sorted = new Map([...map.entries()].sort((a, b) => a[1] - b[1]));
    }
    let extremes = new Map();
    let i = 0; 
    for (const [key, val] of sorted) {
        extremes.set(key, val);
        console.log(key + ":" + val);
        i += 1;
        if (i == 10) {
            break;
        }
    }
    return extremes;
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
        // console.log('clicked screen');
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

            if (parseInt(year) != 2023) {
                document.querySelector('.warning').textContent = event.target.id + " data not available.";
            } else {
                document.querySelector('.warning').textContent = "";
            }
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
            document.querySelector('.warning').textContent = "Loading data. This may\u000Atake a few minutes.";
            for (let page = 1; page < 85; page++) {
                // 100 is max allowed
                const res = await fetch("https://api.umd.io/v1/courses/sections?per_page=100&page=" + page);
                const res_json = await res.json();
                // console.log('parts:')
                // console.log(localStorage.getItem('localData'))
                // console.log(res_json);

                const new_localData = JSON.parse(localStorage.getItem('localData')).concat(res_json);
                localStorage.setItem('localData', JSON.stringify(new_localData));
            }
            document.querySelector('.warning').textContent = "";
            console.log("fetched all data");
            // console.log(localStorage.getItem('localData'))
        }
        
        // console.log(localData);
        
        // console.log(res_json)
        
        data = JSON.parse(localData);

        const aggData = getAggregated(data, year);
        const aggDiff = new Map(aggData[0]);
        const aggSeats = new Map(aggData[1]);
        
        let normalized = new Map();
        
        for (const [major, val] of aggDiff) {
            normalized.set(major, val / aggSeats.get(major));
        } 

        const topMajors = getExtremes(normalized, 0);
        const bottomMajors = getExtremes(normalized, 1);
        
        
    })


}

document.addEventListener('DOMContentLoaded', async () => main()); 

//todo: hide generate
// why refresh change localdata?