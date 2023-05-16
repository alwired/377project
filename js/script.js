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
        // console.log(key + ":" + val);
        i += 1;
        if (i == 10) {
            break;
        }
    }
    return extremes;
}

function filterBySeats(diff, seats, min) {
    let newDiff = new Map();
    let newSeats = new Map();
    for (const [dept, val] of seats) {
        if (val >= min) {
            newDiff.set(dept, diff.get(dept));
            newSeats.set(dept, val);
        }
    }
    return [newDiff, newSeats];
}

function plot(topMajors, bottomMajors) {
    document.querySelector('.right').classList.remove('hidden')
    Highcharts.chart('container', {
        chart: {
            type: 'bar'
        },
        title: {
            text: 'UMD Majors by Course Enrollment Difficulty',
            align: 'left'
        },
        subtitle: {
            text: 'Difference between a major\'s open seats and waitlisted students, scaled by total available seats. Displaying worst 10 and best 10.',
            align: 'left'
        },
        xAxis: {
            categories: [...bottomMajors.keys()].concat([...topMajors.keys()].reverse()),
            title: {
                text: "Department"
            },
            gridLineWidth: 1,
            lineWidth: 0,
        },
        yAxis: {
            min: -0.2,
            title: {
                text: '(open - waitlist) / total',
                align: 'high'
            },
            labels: {
                overflow: 'justify'
            },
            gridLineWidth: 0
        },
        // tooltip: {
        //     valueSuffix: ''
        // },
        plotOptions: {
            bar: {
                borderRadius: '50%',
                dataLabels: {
                    enabled: false
                },
                groupPadding: .1
            }
        },
        legend: {
            layout: 'vertical',
            align: 'right',
            verticalAlign: 'top',
            x: -40,
            y: 80,
            floating: true,
            borderWidth: 1,
            backgroundColor:
                Highcharts.defaultOptions.legend.backgroundColor || '#FFFFFF',
            shadow: true,
            enabled: false
        },
        credits: {
            enabled: false
        },
        series: [{
            data: [...bottomMajors.values()].concat([...topMajors.values()].reverse())
        }]
    });
    
}

async function main(){
    const dropdownButton = document.querySelector('#dd_container');
    const dropdownItems = document.querySelectorAll('.dropdown-item');
    const generate = document.querySelector('#generate');
    const filterInput = document.querySelector('#input');
    const filterContainer = document.querySelector('#filter_container');
    const filterButton = document.querySelector('#filter_button');
    const warning = document.querySelector('#warning');
    const localData = localStorage.getItem('localData');
 
    let data = JSON.parse(localData);
    let year = 0;
    let aggDiff;
    let aggSeats;
    let min = 0;
    
    // console.log(localData);


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
        filterInput.classList.remove('is-info');
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
                document.querySelector('.warning').textContent = event.target.id + " data is not available.";
                generate.classList.add('hidden');
                warning.classList.remove('hidden');
            } else {
                document.querySelector('.warning').textContent = "";
                generate.classList.remove('hidden');
                warning.classList.add('hidden');
            }
        })
    })

    // click filter input
    filterInput.addEventListener('click', async (event) => {
        event.stopPropagation();
        filterInput.classList.add('is-info');
    })

    // text input
    filterInput.addEventListener('input', async (event) => {
        min = event.target.value;
    })

    // click filter button
    filterButton.addEventListener('click', async (event) => {
        const seats = min;
        const newAgg = filterBySeats(aggDiff, aggSeats, seats);
        const newDiff = newAgg[0];
        const newSeats = newAgg[1];

        let newNormalized = new Map();
        for (const [major, val] of newDiff) {
            newNormalized.set(major, val / newSeats.get(major));
        }

        const topMajors = getExtremes(newNormalized, 0);
        const bottomMajors = getExtremes(newNormalized, 1);
        plot(topMajors, bottomMajors);
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
            warning.textContent = "Loading data. This may\u000Atake a few minutes.";
            warning.classList.remove('hidden');

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

            if (!data || data.length < 2) {
                warning.textContent = "API request failed. Type localStorage.clear() in console and refreshing.";
                warning.classList.add('hidden');
            }
            warning.textContent = "";
            warning.classList.add('hidden')
            console.log("fetched all data");
            // console.log(localStorage.getItem('localData'))
        }
        
        // console.log(localData);
        
        // console.log(res_json)
        
        data = JSON.parse(localData);
        const aggData = getAggregated(data, year);
        aggDiff = new Map(aggData[0]);
        aggSeats = new Map(aggData[1]);

        // const filtered = new Map();
        // for (const [dept, val] of aggSeats) {
        //     if (val > 100) {
        //         filtered.set(dept, val);
        //     }
        // }

        // console.log(filtered)
        
        let normalized = new Map();
        
        for (const [major, val] of aggDiff) {
            normalized.set(major, val / aggSeats.get(major));
        } 

        const topMajors = getExtremes(normalized, 0);
        const bottomMajors = getExtremes(normalized, 1);
        
        // console.log(topMajors, bottomMajors);
        filterContainer.classList.remove('hidden');
        plot(topMajors, bottomMajors);
        
    })

    

}

document.addEventListener('DOMContentLoaded', async () => main()); 

//todo: hide generate, fix mobile on main (menu & graph), display table, color bars