# Human Centered Computing Research Subject Pool
## Deployed Site
For demo purposes, the site is deployed in the following link:

http://ec2-54-175-5-206.compute-1.amazonaws.com:5000/

The clients, the researchers of the University of Florida's Human Centered Computing, will be deploying the application on a personal server. However, since the client was out of town when the application was completed, the deployment was still pending at the time this README was completed.

## Credits on Code Usage
This web application makes use of several external code sources outside of those used in the MEAN Full Stack:
- Bootstrap: http://getbootstrap.com/docs/3.3/components/
  - Bootstrap was used extensively in virtually every part of the front-end in the web application.
- Gm.datepickerMultiSelect: https://github.com/spongessuck/gm.datepickerMultiSelect
  - This AngularJS module was used in defineing multiple days in the availability section of study creation editing.
- Angularjs-dropdown-multiselect: https://github.com/dotansimha/angularjs-dropdown-multiselect
  - This AngularJS module was used in selecting multiple options in a drop down in study detail creation and editings.
- Ng-table: http://ng-table.com/api-docs/index.html
  - This external library was used for every table of the front-end in the web application.
- Eonadan-bootstrap-datetimepicker: http://eonasdan.github.io/bootstrap-datetimepicker/
  - This custom Bootstrap library was use in selecting a birthdate for user creation and edit.
- JSON Web Tokens: https://jwt.io/introduction/
  - This external library was used as a means of ensuring security for page access in the web application.
- Jasmine-spec-reporter: https://github.com/bcaudan/jasmine-spec-reporter
  - This external library was used for testing purposes to give real time console output during tests.

## Project Features
Here is a list of features and descriptions for the various features in this project.

### Landing Page
The landing page provides a brief description of the sites purpose and is the only page indexed by search engines. It also provides buttons to sign up and sign in.

![Landing Page](Feature_Screenshots/pastedimage0.png?raw=true "Landing Page Photo")


### Sign Up
The button on the landing page points to the participant sign up (which is the only outward facing sign up page). This page will request the participants information for demographic and compensation purposes and then send them a verification email before they may access the system. Once the participant clicks the link in the email, they will be verified and have access.

![Participant Sign Up](Feature_Screenshots/pastedimage1.png?raw=true "Participant Sign Up Photo")

There are also hidden pages for researcher and faculty sign up (authentication/signup/faculty and authentication/signup/faculty) . These pages request demographic information from faculty and researchers as well so that they may participate in studies, but also requests more specific information like their research position. Once they finish the signup they will also receive a verification email, but they also require admin approval. The admin will see their information in a table and have to approve them before they can access the system with special privileges.

![Researcher Sign Up](Feature_Screenshots/pastedimage2.png?raw=true "Researcher Sign Up Photo")

![Faculty Sign Up](Feature_Screenshots/pastedimage3.png?raw=true "Faculty Sign Up Photo")


### Sign In
The sign in page is used by all users and simply requests their email and password before allowing them to access the system. An authentication token is stored in their browser and will expire after a while.

![Sign In](Feature_Screenshots/pastedimage4.png?raw=true "Sign In Photo")


### Edit Profile and Sign Out
The edit profile and sign out options can be accessed by clicking on the logged in user’s name (at the top left of the window).

The edit profile page presents the user with the database information relevant to them. They are unable to change their role and password here, but can modify fields that may change over time, such as address and position (if they have researcher access). There is also a reset password link which will direct users to the reset password page.

![Edit Profile and Sign Out](Feature_Screenshots/pastedimage5.png?raw=true "Edit Profile and Sign Out Photo")


### Forgot Password
The forgot password page will request the user’s email and then send him an email with a reset password link so that he can change his password and access the system once again.

![Forgot Password](Feature_Screenshots/pastedimage6.png?raw=true "Forgot Password Photo")


### Reset Password
There are two versions of reset password. The first detects when the user is logged in and will prompt them to enter their current password and the new password they would like to change it to.

![Changing Password While Logged In](Feature_Screenshots/pastedimage7.png?raw=true "Changing Password While Logged In Photo")

The second is accessed via the forgot password email and uses an authentication token to identify the user so he can set a new password.

![Changing Password While Not Logged In](Feature_Screenshots/pastedimage8.png?raw=true "Changing Password While Not Logged In Photo")


### Participant Portal
The participant portal provides an interface for participants to view their upcoming sessions and past sessions (which are determined by comparing today’s date to the date of the session). Sessions are highlighted yellow in the upcoming sessions table if the participant is pending approval for that study (researchers have the option of mandating that participants must acquire their approval before being allowed to participate). Once the session is moved to the past sessions table, it will either be highlighted green (if the participant was marked as attended) or red (if the participant was not marked as attended). There is also a button that points to the study discovery page so they can find new studies to participate in.

![Participant Portal](Feature_Screenshots/pastedimage9.png?raw=true "Participant Portal Photo")

The sessions can be clicked to expand the details of the study, including what researchers are in charge of the study, so that they can be contacted for additional details. If the user is pending approval, a message will appear at the top of the modal notifying them that they’re still pending approval. Participants also have the option of cancelling an upcoming session, which will send an email notification to everyone involved in that session and inform them that the participant cancelled the session.

![Participant Portal Session Detail](Feature_Screenshots/pastedimage10.png?raw=true "Participant Portal Session Detail Photo")


### Study Discovery
The study discovery page provides a list of all the open studies in the system that have availability. Studies will not appear if they have been closed, don’t have any available timeslots in the future, or all timeslots are full. The results can be filtered by compensation type and searched using the search bar.

![Study Discovery](Feature_Screenshots/pastedimage11.png?raw=true "Study Discovery Photo")

When a study is clicked, the details of the study will appear in a modal and give the participant the option to sign up for the study (which will direct them to the study sign up page).

![Study Discovery Details](Feature_Screenshots/pastedimage12.png?raw=true "Study Discovery Details Photo")


### Study Sign Up
This page provides a list of all available sessions for the selected study. If the session requires multiple participants and there are partially filled sessions, another table will appear above the empty sessions table to make sessions that require more participants obvious.

![Study Sign Up](Feature_Screenshots/pastedimage13.png?raw=true "Study Sign Up Photo")

When a session is clicked, a modal will appear with details concerning the session, a selector to choose a compensation type, and a button to sign up. After the participant signs up, they will receive a confirmation email. The researchers associated with the study will also receive an email notifying them that the participant signed up. If the session requires multiple participants and the session becomes full upon sign up, all participants and researchers will be notified that the session has been filled and will take place.

![Study Sign Up Details](Feature_Screenshots/pastedimage14.png?raw=true "Study Sign Up Details Photo")


### Daily Email Reminders / Session Cancellation
A CRON job will be set up to access a backend api daily. This api will check every session and determine what sessions are occurring the next day. If the sessions are full, then the participants will be sent a reminder email notifying them of the time and location of the session. The email also includes a link to cancel the session if they need to. However, if the session is not full, then it will be canceled and the participants and researchers will receive a different email informing them of the cancellation due to not having enough participants.


### Researcher Portal
The researcher portal is similar to the participant portal, but also provides tables with their studies, a list of participants that require compensation, and a list of participants already compensated. The studies marked in green have been satisfied by having the number of participants that have completed the study greater than or equal to the number of participants the researcher indicated are desired during study creation. The studies marked in red have been closed. The filter above the studies table can be use to filter studies that are open or closed. Lastly, there is a button at the top right to create a new study.

![Researcher Portal](Feature_Screenshots/pastedimage15.png?raw=true "Researcher Portal Photo")
![Researcher Portal 2](Feature_Screenshots/pastedimage16.png?raw=true "Researcher Portal 2 Photo")

When the studies are clicked, a modal appears with the study details and some relevant statistics involving the study. For more in depth data and demographics, the researcher can click the view data button. There are also button options to edit and close the study. The edit button will direct the researcher to the edit study page while the close button will simply mark the study as closed and remove it from the study discovery list so no new participants can sign up for it. If the researcher clicks on a closed study (marked in red) a modal will appear that includes the option to reopen the study or view data for it.

![Researcher Portal Open Study Details](Feature_Screenshots/pastedimage17.png?raw=true "Researcher Portal Open Study Details Photo")

![Researcher Portal Closed Study Details](Feature_Screenshots/pastedimage18.png?raw=true "Researcher Portal Closed Study Details Photo")

When sessions are clicked, a modal appears that is very similar to the participant’s session modal with the session details and ability to cancel. However, it also includes checkboxes to mark participants as attended. This will move participants that selected monetary compensation to the awaiting compensation table and allow participants that selected extra credit to appear in the faculty’s extra credit table.

![Researcher Portal Attendence](Feature_Screenshots/pastedimage19.png?raw=true "Researcher Portal Attendence Photo")

When a participant in the awaiting compensation table is clicked, a modal will appear with the participants details and a button that will mark them as compensated. This will move participants to the already compensated table and record the date that the participant was marked compensated for the researchers records. Clicking a participant in the already compensated table brings up a similar modal that displays the information and date compensated.

![Researcher Portal Study Participant Details](Feature_Screenshots/pastedimage20.png?raw=true "Researcher Portal Study Participant Details Photo")

![Researcher Portal Study Compensated Participant Details](Feature_Screenshots/pastedimage21.png?raw=true "Researcher Portal Study Compensated Participant Details Photo")


### Study Data
The study data page finds all the sessions for a given study and uses them to calculate demographical data about participants. After participants complete the study, the data at the top is populated totals, averages, standard deviations, and percentages concerning both age and gender. The table of sessions can be filtered by whether it was completed or not (which is determined by whether participants were marked as attended). There is also an optional table at the bottom of the page that contains participants who are currently awaiting approval for the study (if the researcher marked the study as requiring participants to gain approval).

![Study Data](Feature_Screenshots/pastedimage22.png?raw=true "Study Data Photo")

When a session is clicked, a modal appears with the session details and each participant’s demographic information for a more granular view.

![Study Data Session Info](Feature_Screenshots/pastedimage23.png?raw=true "Study Data Session Info Photo")

When an awaiting participant is clicked, a modal appears with the session time and participant name and email so they can be sent a survey that verifies they can participate in the study. There are also two buttons that allow the participant to be either approved (given access to participate) or denied (removed from the session).

![Study Data User Info](Feature_Screenshots/pastedimage24.png?raw=true "Study Data User Info Photo")


### Create/Edit Study Details
When creating a new study or editing a study, the researcher is presented with a form that takes study details. Most fields are self explanatory, but some fields include popover tips that explain what they are meant for. If monetary is included as a compensation type, a compensation amount field also appears. The selector at the bottom can also be used to add additional researchers to the study so they can manage sessions and data. Once the submit button is clicked, the researcher is directed to the availability page.

![Create Study](Feature_Screenshots/pastedimage25.png?raw=true "Create Study Photo")


### Create/Edit Study Availability
The availability page appears after creating or editing a study and is used to specify what time ranges a researcher is available to host sessions for the study. The calendar on the left side is used to select which days they’d like a timeslot to be and is used to populate the right side user interface. There is also the option above the calendar to select individual days or select a range of days. Every time the add time range button is clicked a new timeslot appears for that day and allows the researcher to select a new start and end time for that day. The remove button is used to remove a day from the calendar. The copy button can be used to copy all of the timeslots for a given day. The paste button is used to paste the copied timeslots to a new day. Once the researcher is finished selecting time slots they can click the submit button at the top right.

![Create Availability](Feature_Screenshots/pastedimage26.png?raw=true "Create Availability Photo")


### Faculty Portal
The faculty portal consists of a single extra credit table that populates based on the course and semester selected. After selecting the course and semester, the system will find a list of studies that have been completed (where students were marked as attended) during the time frame of that semester and where students selected that course as their extra credit compensation. There is also an add course button at the top right that allows the user to input a new course code into the system for extra credit opportunities.

![Faculty Portal](Feature_Screenshots/pastedimage27.png?raw=true "Faculty Portal Photo")

When the add course button is clicked, a modal appears and asks for the new course’s course code. Once submitted, it will be added to the system as an option for participants upon study sign up.

![Faculty Portal Add Course](Feature_Screenshots/pastedimage28.png?raw=true "Faculty Portal Add Course Photo")

When a study is clicked in the table, a modal appears with a list of students who completed the study for extra credit in the class. There is also an export option below the table that creates a CSV file with the list of students that is compatible with Canvas.

![Faculty Portal Export Students](Feature_Screenshots/pastedimage29.png?raw=true "Faculty Portal Export Students Photo")


### Admin Portal
The admin portal contains a table of faculty and researchers who are awaiting approval to access the system. Whenever a researcher or faculty member signs up, the admin will receive an email notifying them that the user is awaiting approval. It also includes a button that points to the manage users page.

![Admin Portal](Feature_Screenshots/pastedimage30.png?raw=true "Admin Portal Photo")

When a user is clicked, a modal appears with that user’s details and buttons to approve or deny them. If the approve button is clicked, the user will be granted access to the system and notified by email that they’ve been approved. If they are denied, they will be deleted from the system and sent an email notifying them that they were denied access.

![Admin Portal User Details](Feature_Screenshots/pastedimage31.png?raw=true "Admin Portal User Details Photo")


### Admin Manager Users
The manage users page is only accessible to admins and contains a list of all users in the system. The users can be filtered by role and searched by using the search bar. There is also a button that points to the create user page at the top right of the table.

![Admin Portal User Manage](Feature_Screenshots/pastedimage32.png?raw=true "Admin Portal User Manage Photo")

When a user is clicked, a modal appears that contains the user’s details and a button that points to the edit user page.

![Admin Portal User Manage Details](Feature_Screenshots/pastedimage33.png?raw=true "Admin Portal User Manage Details Photo")


### Admin Create Users
When creating or editing a new user, the admin is presented with a form that takes user details. Fields change dynamically based on the role selected. If a user is being created, an email with be sent to the user with a link to set their password.

![Admin Portal Create Users](Feature_Screenshots/pastedimage34.png?raw=true "Admin Portal Create Users Photo")

## Instructions On How to Run the Web Application Locally
The following steps must be performed to run the web application locally:
1. Clone the repository to obtain the source code using ```git clone https://github.com/WebAppUF3B/WebApp.git```
2. Install Node version 6.11.3 from https://nodejs.org/download/release/v6.11.3/
3. Using the command line, move to the directory where the web application was cloned to and run ```npm install```
4. Add the .env file to the top level of the project (the root of the folder of the web application)
   - For confidentiality's sake, the .env file is not in the Git repository - the contents of the .env file can be found in the Client Documentation. If further assistance is required, please contact one of the team members listed in the Client Documentation.
5. From the command line (while stil in the web application folder), run ```npm start```
After following the instructions, the website will be hosted on http://localhost:5000/
## How to Update Database and Server Connections
Currently, the MongoDB database is at: mongodb://ufhcc:ufwebapp3b@ds040017.mlab.com:40017/ufhcc
To change out the database, one would need to update the MONGOLAB_URI field in the .env file to the new, valid MLab URI.
