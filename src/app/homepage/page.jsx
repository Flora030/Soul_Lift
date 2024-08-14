"use client";

import React, { useState } from "react";
import Sidebar from "@/components/sidebar"; // Adjust the path according to your file structure
import { Menu } from "lucide-react";

const Homepage = () => {
    return (
        <div className="flex">
            <Sidebar/>
        </div>
    );
};

export default Homepage;
