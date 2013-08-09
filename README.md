OAP Nepal Data Processing
====================

#Overview

From March-June, 2013, Development Gateway, the Open Aid Partnership, and the Government of Nepal worked on a pilot exercise to collect and code procurement data in Nepal. The goal of that exercise was to see the degree to which open procurement data could provide operationally-relevant information on development activities, with the view of aiding planners and policy makers to better understand patterns of spending in their sectors/countries.

Public information on procurement was obtained from the World Bank, the Asian Development Bank, and Nepal’s Department of Local Infrastructure Development and Agricultural Roads. The DG team focused the pilot on four primary sectors: Water and Sanitation, Transportation, Energy, and Education. Documents for 38 unique projects were collected for the pilot, resulting in 435 individual contracts and tender awards. Geographic information for these procurement documents were also coded, allowing the procurement data to be mapped to specific point locations.

#This Repo

This repository contains some of the scripts used to parse the data from its original format (spreadsheets manually completed by coders) into JSON objects, and then to save those objects into MongoDB. The repository is unlikely to have external value, except perhaps the data model which can be seen in the folder ./schema.