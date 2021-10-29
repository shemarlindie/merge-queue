import { PropsWithChildren } from "react";
import { BsHouse, MdNavigateNext } from "react-icons/all";
import { Breadcrumbs, IconButton } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

export function LayoutBreadcrumbs({children}: PropsWithChildren<any>) {
  return (
    <div className="p-2 border-bottom">
      <Breadcrumbs separator={<MdNavigateNext/>} aria-label="breadcrumb">
        <IconButton
          size="small"
          color="inherit"
          component={RouterLink}
          to="/">
          <BsHouse/>
        </IconButton>

        {children}
      </Breadcrumbs>
    </div>
  )
}