/**
 * SSMUH Planner - Zone Information Module
 * 
 * This module handles displaying zone-specific information.
 * 
 * - Displays setback requirements
 * - Displays height restrictions
 * - Displays lot coverage information
 * - Displays third storey restrictions
 */

/**
 * Initialize the zone information module
 */
function initializeZoneInfoModule() {
  // Add event listener for zone type change
  const zoneTypeSelect = document.getElementById('zoneType');
  if (zoneTypeSelect) {
    zoneTypeSelect.addEventListener('change', function() {
      // Get the zone type and pass it to updateZoneHelp
      const zoneType = this.value;
      updateZoneHelp(zoneType);
    });
  }
}

/**
 * Update zone help text based on zone type
 */
/**
 * Update zone help text based on zone type
 * 
 * @param {Event|string} zoneTypeOrEvent The zone type or change event
 */
/**
 * Update zone help text based on zone type
 * 
 * @param {string} zoneType The zone type
 */
function updateZoneHelp(zoneType) {
  // If no zone type, exit early
  if (!zoneType) return;
  
  const helpText = document.getElementById('zoneHelp');
  if (!helpText) return;
  
  if (zoneType === 'R1A' && ssmuhRules.zoningAreas && ssmuhRules.zoningAreas.residentialZones) {
    const zoneInfo = ssmuhRules.zoningAreas.residentialZones.R1A;
    helpText.innerHTML = zoneInfo.allowsSSMUH ? 'SSMUH is allowed in this zone.' : 'SSMUH is not allowed in this zone.';
  } else if (zoneType.startsWith('R1') && ssmuhRules.zoningAreas && ssmuhRules.zoningAreas.residentialZones) {
    const zoneInfo = ssmuhRules.zoningAreas.residentialZones.R1B_R1C_R1D_R1E;
    helpText.innerHTML = zoneInfo.allowsSSMUH ? 'SSMUH is allowed in this zone.' : 'SSMUH is not allowed in this zone.';
  } else if (zoneType === 'R2' && ssmuhRules.zoningAreas && ssmuhRules.zoningAreas.residentialZones) {
    const zoneInfo = ssmuhRules.zoningAreas.residentialZones.R2;
    helpText.innerHTML = zoneInfo.allowsSSMUH ? 'SSMUH is allowed in this zone.' : 'SSMUH is not allowed in this zone.';
  } else if (zoneType === 'R-CL' && ssmuhRules.zoningAreas && ssmuhRules.zoningAreas.residentialZones) {
    const zoneInfo = ssmuhRules.zoningAreas.residentialZones.R_CL;
    helpText.innerHTML = zoneInfo.allowsSSMUH ? 'SSMUH is allowed in this zone.' : 'SSMUH is not allowed in this zone.';
  } else if (zoneType.startsWith('SR') && ssmuhRules.zoningAreas && ssmuhRules.zoningAreas.suburbanResidential) {
    const zoneInfo = ssmuhRules.zoningAreas.suburbanResidential[zoneType];
    if (zoneInfo) {
      helpText.innerHTML = zoneInfo.allowsSSMUH ? 'SSMUH is allowed in this zone.' : 'SSMUH is not allowed in this zone.';
    } else {
      helpText.innerHTML = 'Zone information not available.';
    }
  } else if (zoneType === 'CD' && ssmuhRules.zoningAreas && ssmuhRules.zoningAreas.comprehensiveDevelopmentZones) {
    helpText.innerHTML = 'CD zones may allow SSMUH. Please check specific CD zone number against allowed zones list.';
  } else {
    helpText.innerHTML = '';
  }
}

/**
 * Display zone-specific information
 * 
 * @param {string} zoneType The zone type
 */
function displayZoneInfo(zoneType) {
  const zoneInfoContent = document.getElementById('zoneInfoContent');
  if (!zoneInfoContent) return;
  
  const appState = window.ssmuhPlanner.appState;
  
  let htmlContent = '<div class="row">';
  
  // Add setbacks information
  htmlContent += '<div class="col-md-6">';
  htmlContent += '<h4>Setback Requirements</h4>';
  htmlContent += '<table class="table table-sm">';
  htmlContent += '<thead><tr><th>Location</th><th>Principal Building</th><th>Accessory Building</th></tr></thead>';
  htmlContent += '<tbody>';
  
  // Get setback information
  const setbacks = appState.setbacks;
  if (setbacks) {
    // Front setback
    htmlContent += '<tr><td>Front</td>';
    if (setbacks.principalBuilding && setbacks.principalBuilding.frontLotLine) {
      const frontMin = setbacks.principalBuilding.frontLotLine.min;
      const frontMax = setbacks.principalBuilding.frontLotLine.max;
      htmlContent += `<td>${frontMin}m${frontMax ? ' to ' + frontMax + 'm' : ''}</td>`;
    } else {
      htmlContent += '<td>-</td>';
    }
    
    if (setbacks.accessoryDwellingUnit && setbacks.accessoryDwellingUnit.frontLotLine) {
      const accFront = setbacks.accessoryDwellingUnit.frontLotLine.min;
      const accFrontNote = setbacks.accessoryDwellingUnit.frontLotLine.note;
      htmlContent += `<td>${accFront}m${accFrontNote ? ' (' + accFrontNote + ')' : ''}</td>`;
    } else {
      htmlContent += '<td>-</td>';
    }
    htmlContent += '</tr>';
    
    // Rear setback
    htmlContent += '<tr><td>Rear</td>';
    if (setbacks.principalBuilding && setbacks.principalBuilding.rearLotLine) {
      htmlContent += `<td>${setbacks.principalBuilding.rearLotLine.min}m</td>`;
    } else {
      htmlContent += '<td>-</td>';
    }
    
    if (setbacks.accessoryDwellingUnit && setbacks.accessoryDwellingUnit.rearLotLine) {
      htmlContent += `<td>${setbacks.accessoryDwellingUnit.rearLotLine.min}m</td>`;
    } else {
      htmlContent += '<td>-</td>';
    }
    htmlContent += '</tr>';
    
    // Side setback
    htmlContent += '<tr><td>Side (Interior)</td>';
    if (setbacks.principalBuilding && setbacks.principalBuilding.sideInteriorLotLine) {
      htmlContent += `<td>${setbacks.principalBuilding.sideInteriorLotLine.min}m</td>`;
    } else if (setbacks.principalBuilding && setbacks.principalBuilding.sideInteriorOrLaneOrLocalStreet) {
      htmlContent += `<td>${setbacks.principalBuilding.sideInteriorOrLaneOrLocalStreet.min}m</td>`;
    } else {
      htmlContent += '<td>-</td>';
    }
    
    if (setbacks.accessoryDwellingUnit && setbacks.accessoryDwellingUnit.sideInteriorLotLine) {
      htmlContent += `<td>${setbacks.accessoryDwellingUnit.sideInteriorLotLine.min}m</td>`;
    } else if (setbacks.accessoryDwellingUnit && setbacks.accessoryDwellingUnit.sideInteriorOrLaneOrLocalStreet) {
      htmlContent += `<td>${setbacks.accessoryDwellingUnit.sideInteriorOrLaneOrLocalStreet.min}m</td>`;
    } else {
      htmlContent += '<td>-</td>';
    }
    htmlContent += '</tr>';
    
    // Side street setback (corner lot)
    htmlContent += '<tr><td>Side (Street)</td>';
    if (setbacks.principalBuilding && setbacks.principalBuilding.sideCollectorOrArterialStreet) {
      htmlContent += `<td>${setbacks.principalBuilding.sideCollectorOrArterialStreet.min}m</td>`;
    } else {
      htmlContent += '<td>-</td>';
    }
    
    if (setbacks.accessoryDwellingUnit && setbacks.accessoryDwellingUnit.sideCollectorOrArterialStreet) {
      htmlContent += `<td>${setbacks.accessoryDwellingUnit.sideCollectorOrArterialStreet.min}m</td>`;
    } else {
      htmlContent += '<td>-</td>';
    }
    htmlContent += '</tr>';
  }
  
  htmlContent += '</tbody></table>';
  htmlContent += '</div>';
  
  // Add height and coverage information
  htmlContent += '<div class="col-md-6">';
  
  // Height restrictions
  htmlContent += '<h4>Height Restrictions</h4>';
  htmlContent += '<table class="table table-sm">';
  htmlContent += '<tbody>';
  htmlContent += `<tr><td>Standard Dwelling Units</td><td>${ssmuhRules.heightRestrictions.allOtherDwellingUnits.maxHeight}m</td></tr>`;
  htmlContent += `<tr><td>Infill Housing Near Rear Lot Line</td><td>${ssmuhRules.heightRestrictions.infillHousingNearRearLotLine.maxHeight}m</td></tr>`;
  htmlContent += `<tr><td>Accessory Non-Dwelling Structures</td><td>${ssmuhRules.heightRestrictions.accessoryNonDwellingStructures.maxHeight}m</td></tr>`;
  htmlContent += '</tbody></table>';
  
  // Third storey restrictions
  htmlContent += '<h4>Third Storey Restrictions</h4>';
  htmlContent += '<table class="table table-sm">';
  htmlContent += '<tbody>';
  
  // Get third storey restrictions
  if (zoneType === 'R-CL' || zoneType === 'R-CLA' || zoneType === 'R-CLB' || zoneType === 'R-CLCH') {
    // Compact lot zones have different third storey rules
    if (appState.zoneInfo && appState.zoneInfo.thirdStoreyRestrictions) {
      htmlContent += `<tr><td>1-2 Dwelling Units</td><td>${appState.zoneInfo.thirdStoreyRestrictions.oneOrTwoDwellingUnits}</td></tr>`;
      htmlContent += `<tr><td>3-4 Dwelling Units</td><td>${appState.zoneInfo.thirdStoreyRestrictions.threeOrFourDwellingUnits}</td></tr>`;
    } else {
      htmlContent += `<tr><td>1-2 Dwelling Units</td><td>50% of first storey floor area</td></tr>`;
      htmlContent += `<tr><td>3-4 Dwelling Units</td><td>80% of first storey floor area</td></tr>`;
    }
  } else {
    // Standard zones
    htmlContent += `<tr><td>1-2 Dwelling Units</td><td>${ssmuhRules.thirdStoreyRestrictions.oneOrTwoDwellingUnits.note}</td></tr>`;
    htmlContent += `<tr><td>3 Dwelling Units</td><td>${ssmuhRules.thirdStoreyRestrictions.threeDwellingUnits.maxFloorArea}% of first storey floor area</td></tr>`;
    htmlContent += `<tr><td>4 Dwelling Units</td><td>${ssmuhRules.thirdStoreyRestrictions.fourDwellingUnits.maxFloorArea}% of first storey floor area</td></tr>`;
  }
  
  htmlContent += '</tbody></table>';
  
  // Lot coverage information
  htmlContent += '<h4>Lot Coverage</h4>';
  const isInfillPresent = window.ssmuhPlanner && window.ssmuhPlanner.appState ? 
                        window.ssmuhPlanner.appState.isInfillPresent : false;
                        
  if (zoneType === 'R-CL' || zoneType === 'R-CLA' || zoneType === 'R-CLB' || zoneType === 'R-CLCH') {
    htmlContent += '<p><strong>Compact Lot Zone Rules:</strong></p>';
    htmlContent += '<ul>';
    htmlContent += `<li>Small lots (≤ ${ssmuhRules.compactLotZones.lotAreaThresholds.small.maxAreaM2}m²): ${ssmuhRules.compactLotZones.lotAreaThresholds.small.maxBuildingCoverage}% max coverage</li>`;
    
    const standardCoverage = ssmuhRules.compactLotZones.lotAreaThresholds.standard.maxBuildingCoverage;
    const infillCoverage = ssmuhRules.compactLotZones.lotAreaThresholds.standard.withInfillHousingCoverage;
    
    if (isInfillPresent) {
      htmlContent += `<li>Standard lots (> ${ssmuhRules.compactLotZones.lotAreaThresholds.small.maxAreaM2}m²): <s>${standardCoverage}%</s> <strong>${infillCoverage}%</strong> with infill housing (applies)</li>`;
    } else {
      htmlContent += `<li>Standard lots (> ${ssmuhRules.compactLotZones.lotAreaThresholds.small.maxAreaM2}m²): ${standardCoverage}% standard, ${infillCoverage}% with infill housing</li>`;
    }
    htmlContent += '</ul>';
  } else {
    htmlContent += '<ul>';
    const standardCoverage = ssmuhRules.lotCoverage.standard.maxCoverage;
    const infillCoverage = ssmuhRules.lotCoverage.withInfillHousing.maxCoverage;
    
    if (isInfillPresent) {
      htmlContent += `<li>Standard: <s>${standardCoverage}%</s> of lot area</li>`;
      htmlContent += `<li>With Infill Housing: <strong>${infillCoverage}%</strong> of lot area (applies)</li>`;
    } else {
      htmlContent += `<li>Standard: ${standardCoverage}% of lot area</li>`;
      htmlContent += `<li>With Infill Housing: ${infillCoverage}% of lot area</li>`;
    }
    htmlContent += '</ul>';
  }

  if (isInfillPresent) {
    htmlContent += '<div class="alert alert-info mt-2" style="font-size: 0.9rem;">';
    htmlContent += '<strong>Infill Housing:</strong> Your existing dwelling built before June 10, 2024 qualifies for increased lot coverage.';
    htmlContent += '</div>';
  }
  
  htmlContent += '</div>';
  htmlContent += '</div>';
  
  // Set the HTML content
  zoneInfoContent.innerHTML = htmlContent;
}

/**
 * Show zone-specific information section
 * 
 * @param {boolean} show Whether to show the section
 */
function showZoneInfoSection(show) {
  const zoneInfoSection = document.getElementById('zone-info-section');
  if (zoneInfoSection) {
    if (show) {
      zoneInfoSection.classList.remove('disabled-section');
      // Display zone info for the current zone
      displayZoneInfo(window.ssmuhPlanner.appState.zoneType);
    } else {
      zoneInfoSection.classList.add('disabled-section');
    }
  }
}

// Export functions for use in other modules
window.updateZoneHelp = updateZoneHelp;
window.displayZoneInfo = displayZoneInfo;
window.showZoneInfoSection = showZoneInfoSection;

// Initialize on DOMContentLoaded
document.addEventListener('DOMContentLoaded', initializeZoneInfoModule);
