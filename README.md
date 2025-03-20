# SSMUH Planner

A Small-Scale Multi-Unit Housing (SSMUH) planning tool for the Township of Langley.

## Overview

SSMUH Planner is an interactive web tool that helps property owners visualize and plan small-scale multi-unit housing developments on their lots based on the Township of Langley's zoning bylaws. This tool allows users to:

- Check eligibility of their lot for SSMUH development
- Design lot layouts with various structures
- Visualize setbacks and zoning restrictions
- Calculate building coverage and parking requirements
- Ensure compliance with Township zoning requirements

The Bylaws and Council Minutes are available in the **sources** folder.

Try it online: [SSMUH Planner on Strong Towns Langley](https://strongtownslangley.org/ssmuh)

## Features

- **Eligibility Check**: Determine if your lot is eligible for SSMUH development based on lot size, zone type, services, and other criteria
- **Visual Lot Designer**: Drag-and-drop interface for designing your lot layout
- **Real-time Validation**: Immediate feedback on setback violations and other zoning requirements
- **Zone-specific Information**: Display of relevant zoning information based on your lot's zone
- **Building Coverage Calculator**: Automatic calculation of lot coverage percentage
- **Structure Management**: Add, edit, and remove various structures (principal dwellings, infill housing, accessory dwellings, etc.)

## Technical Details

The SSMUH Planner is a web-based application built with:

- PHP for server-side processing
- JavaScript for interactive functionality
- HTML/CSS for the user interface
- Bootstrap for responsive design
- JSON for zoning bylaw data

The application is designed to be embeddable in existing websites or used as a standalone tool.

## Usage

### For End Users

1. Visit the [SSMUH Planner](https://strongtownslangley.org/ssmuh)
2. Enter your lot dimensions, zone type, and other property details
3. Check eligibility for SSMUH development
4. If eligible, use the lot designer to add and position structures
5. View calculated metrics and zoning requirements

### For Developers

To integrate the SSMUH Planner into an existing website:

```php
<?php
include("path/to/ssmuhplanner/index.php");
?>
```

## Development

### Setup

1. Clone the repository:
   ```
   git clone https://github.com/strongtownslangley/ssmuhplanner.git
   ```
2. Place the files in your web server directory
3. Access the planner through your web server

### Customization

The planner can be customized by modifying:

- `data/ssmuh-zoning-bylaw.json` - Update zoning rules and restrictions
- `assets/css/main.css` - Modify the visual appearance
- `includes/templates/` - Change the HTML templates

## License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.

## Credits

- Developed by James Hansen (james@strongtownslangley.org)
- For Strong Towns Langley
- Copyright © 2025 Langley Urbanist Society (https://strongtownslangley.org/society)

## Contact

For questions, feedback, or support, please contact:
- Strong Towns Langley: [Website](https://strongtownslangley.org)
- Email: james@strongtownslangley.org
