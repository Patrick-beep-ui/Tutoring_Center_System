import React from 'react';
import PeopleAltSharpIcon from '@mui/icons-material/PeopleAltSharp';
import ApartmentSharpIcon from '@mui/icons-material/ApartmentSharp';
import AssignmentIndSharpIcon from '@mui/icons-material/AssignmentIndSharp';
import HomeSharpIcon from '@mui/icons-material/HomeSharp';
import ForumRoundedIcon from '@mui/icons-material/ForumRounded';
import UploadFileRoundedIcon from '@mui/icons-material/UploadFileRounded';

export const SidebarData = [
    {
        title: "Activity",
        icon: <PeopleAltSharpIcon/>,
        link: "/users"
    },
    {
        title: "profile",
        icon: <ApartmentSharpIcon/>,
        link: "/profile/:tutor_id"
    },
    {
        title: "Home",
        icon: <AssignmentIndSharpIcon/>,
        link: "/"
    },   
    {
        title: "Reports",
        icon: <ForumRoundedIcon/>,
        link: "/report"
    },
    {
        title: "Upload",
        icon: <UploadFileRoundedIcon/>,
        link: "/upload"
    },
    {
        title: "Calendar",
        icon: <UploadFileRoundedIcon/>,
        link: "/calendar/:tutor_id"
    },

]
