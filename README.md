# UMD Overflow
https://alwired.github.io/377project/index.html

### Compatibility
Chrome 46+, Edge 12+, Firefox 16+, Opera 37+, Safari 8+, Android Browser 113+

### Dependencies
API: https://beta.umd.io/  
JS libraries: Highcharts 11.0.1  
CSS frameworks: Bulma 0.9.4  

### Info
As a student, it's frustrating to be on the waitlist for a course. The reasons for this vary- some departments have problems with finding enough professors, and some may just have more classes popular with nonmajor students. The goal of this project is to get some objective measurement of how hard it is to get into a course for a certain major at the University of Maryland. I do this by taking the difference between open seats and waitlisted students across a major, and divide that by total available seats to help control for department size for a more accurate comparison. Since I use a single-value metric, it's logical to use a bar chart to visualize these differences using charts from the Highcharts library. The purpose of visualizing this data is to bring attention to the worst-offending majors to help inform decisions for both students and administrators. If you're a student and on the fence between two majors, you might take a look at this list and decide to pick the one that allows you to be more likely to graduate on time. If you're a UMD administrator, you may want to consider reallocating resources to or from some of the departments in this chart. Data is collected from https://beta.umd.io/, which has information about all course section.

Currently, there are a few limitations with the analysis, one of which is the way the API is structured. Data for all sections at once is only available for the most recent semester, so getting past semesters would involve recording each current section, and making a request for each section for each semester. Since there are over 8400 sections, and this API is a bit slow, this process is a bit unwieldy. Another problem with the dataset is that we mainly wanted to look at majors, but the data includes nonmajor departments. Some of these departments have a lot of empty classes, which is why the top 8 have a value of 1 (no enrolled students). I couldn't find a list of major-only departmental codes, so filtering the others out would require manually going through every major to get its code. 
