import { groupByFields, QueueItem, QueueSection } from "./models";
import { Button, Menu, MenuItem } from "@mui/material";
import { MdViewAgenda } from "react-icons/all";
import React from "react";

export type GroupConfig = { [key: string]: keyof QueueItem }

export function makeGroupConfig(sections: QueueSection[]) {
  const config: GroupConfig = {}
  for (const section of sections) {
    config[section.name] = section.groupBy
  }
  return config
}

export interface QueueTableGroupConfigProps {
  config: GroupConfig,
  section: QueueSection,
  onChange?: (section: QueueSection, field: keyof QueueItem) => void
}

export function QueueTableGroupConfig({config, section, onChange}: QueueTableGroupConfigProps) {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleMenu = (event: React.UIEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleChangeGroupConfig = (section: QueueSection, field: keyof QueueItem) => {
    if (onChange) {
      onChange(section, field)
    }
    handleMenuClose()
  }

  return (
    <div>
      <Button endIcon={<MdViewAgenda/>}
              style={{textTransform: 'none'}}
              color={"inherit"}
              size="large"
              aria-label="group by"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleMenu}>
        Group by
      </Button>
      <Menu
        id="menu-appbar"
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        keepMounted
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}>
        {groupByFields.map((field) => <MenuItem key={field}
                                                onClick={() => handleChangeGroupConfig(section, field)}>{field}</MenuItem>)}
      </Menu>
    </div>
  )
}