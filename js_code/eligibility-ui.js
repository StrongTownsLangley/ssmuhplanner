/**
 * SSMUH Planner - Eligibility UI Module
 * 
 * This module handles the user interface for displaying eligibility information.
 */

/**
 * Setup event listeners to call checkEligibility when form fields change
 */
function setupEligibilityChangeListeners() {
	// Get all form input elements
	const formInputs = [
	  document.getElementById('lotWidth'),
	  document.getElementById('lotDepth'),
	  document.getElementById('zoneType'),
	  document.getElementById('loadingType'),
	  document.getElementById('hasSewerService'),
	  document.getElementById('hasWaterService'),
	  document.getElementById('isCornerLot'),
	  document.getElementById('isArterialRoad'),
	  document.getElementById('withinUCB'),
	  document.getElementById('hasHeritage'),
	  document.getElementById('inWillowbrook'),
	  document.getElementById('hasExistingDwelling'),
	];
	
	// Add change event listeners to all form elements
	formInputs.forEach(input => {
	  if (input) {
		input.addEventListener('change', function() {
		  // Call checkEligibility to update the display
		  checkEligibility();
		});
		
		// For number/text inputs, also listen for input events to catch typing
		if (input.type === 'number' || input.type === 'text') {
		  input.addEventListener('input', function() {
			// Use a small delay to avoid too frequent updates while typing
			if (this.updateTimeout) clearTimeout(this.updateTimeout);
			this.updateTimeout = setTimeout(() => {
			  checkEligibility();
			}, 500); // 500ms delay
		  });
		}
	  }
	});
  }
  

/**
 * Display eligibility check results in the UI
 * 
 * @param {object} result Eligibility validation result
 */
function displayEligibilityResult(result) {
	const eligibilityResult = document.getElementById('eligibilityResult');
	const eligibilityAlert = document.getElementById('eligibilityAlert');
	const lotBuilderSection = document.getElementById('lot-builder-section');
	const zoneInfoSection = document.getElementById('zone-info-section');
  
	if (eligibilityResult && eligibilityAlert) {
	  eligibilityResult.style.display = 'block';
	  
	  if (result.isEligible && result.zoneAllowsSSMUH) {
		if (result.hasWarnings) {
		  eligibilityAlert.className = 'alert alert-warning';
		  eligibilityAlert.innerHTML = `Your may require special approvals - ${result.warningMessage}, but may still be eligible for SSMUH with up to ${appState.maxUnits} units`;
		} else {
		  eligibilityAlert.className = 'alert alert-success';
		  eligibilityAlert.textContent = `Your property is eligible for SSMUH with up to ${appState.maxUnits} units`;
		}
		
		// Add infill housing note if applicable
		if (appState.isInfillPresent) {
		  const maxCoverage = calculateMaxCoverage();
		  const standardCoverage = appState.zoneType.startsWith('R-CL') ? 
		    ssmuhRules.compactLotZones.lotAreaThresholds.standard.maxBuildingCoverage : 
		    ssmuhRules.lotCoverage.standard.maxCoverage;
		    
			eligibilityAlert.textContent += ` and qualifies for increased lot coverage due to the existing dwelling (infill housing).`;		  
		}
		
		// Enable lot builder and zone info sections
		lotBuilderSection.classList.remove('disabled-section');
		zoneInfoSection.classList.remove('disabled-section');
		
		// Call the initialization function from lotCanvas.js
		initializeLotCanvas();

		// Setup listeners for real-time updates if not already setup
		if (!window.eligibilityListenersSetup) {
			setupEligibilityChangeListeners();
			window.eligibilityListenersSetup = true;
		}
      
		// Display zone-specific information
		displayZoneInfo(appState.zoneType);
	  } else {
		eligibilityAlert.className = 'alert alert-danger';
		eligibilityAlert.textContent = 'Your property is not eligible for SSMUH: ' + result.eligibilityMessage;
		
		// Disable lot builder and zone info sections
		lotBuilderSection.classList.add('disabled-section');
		zoneInfoSection.classList.add('disabled-section');
	  }
	}
  }
  
  /**
   * Display zone-specific information in the UI
   * 
   * @param {string} zoneType The zone type
   */
  function displayZoneInfo(zoneType) {
	const zoneInfoContent = document.getElementById('zoneInfoContent');
	if (!zoneInfoContent) return;
	
	let htmlContent = '<div class="row">';
	
	// Add setbacks information
	htmlContent += '<div class="col-md-6">';
	htmlContent += '<h4>Setback Requirements</h4>';
	htmlContent += '<table class="table table-sm">';
	htmlContent += '<thead><tr><th>Location</th><th>Principal Building</th><th>Accessory Building</th></tr></thead>';
	htmlContent += '<tbody>';
	
	// Generate setbacks table rows
	htmlContent += generateSetbacksTableRows();
	
	htmlContent += '</tbody></table>';
	
	// Add corner lot sight triangle information if applicable
	if (appState.isCornerLot) {
	  htmlContent += generateCornerLotTriangleInfo();
	}
	
	htmlContent += '</div>';
	
	// Add height and coverage information
	htmlContent += '<div class="col-md-6">';
	
	// Generate height restrictions table
	htmlContent += generateHeightRestrictionsTable();
	
	// Generate third storey restrictions table
	htmlContent += generateThirdStoreyRestrictionsTable(zoneType);
	
	// Generate lot coverage information
	htmlContent += generateLotCoverageInfo(zoneType);
	
	// Add special considerations for arterial roads
	if (appState.isArterialRoad) {
	  htmlContent += generateArterialRoadInfo();
	}
	
	htmlContent += '</div>';
	htmlContent += '</div>';
	
	// Set the HTML content
	zoneInfoContent.innerHTML = htmlContent;
  }
  
  /**
   * Generate setback table rows HTML
   * 
   * @return {string} HTML for setback table rows
   */
  function generateSetbacksTableRows() {
	let html = '';
	const setbacks = appState.setbacks;
	const isArterialRoad = appState.isArterialRoad;
	
	if (setbacks) {
	  // Front setback
	  html += '<tr><td>Front</td>';
	  if (setbacks.principalBuilding && setbacks.principalBuilding.frontLotLine) {
		const frontMin = setbacks.principalBuilding.frontLotLine.min;
		const frontMax = setbacks.principalBuilding.frontLotLine.max;
		html += `<td>${frontMin}m${frontMax ? ' to ' + frontMax + 'm' : ''}</td>`;
	  } else {
		html += '<td>-</td>';
	  }
	  
	  if (setbacks.accessoryDwellingUnit && setbacks.accessoryDwellingUnit.frontLotLine) {
		const accFront = setbacks.accessoryDwellingUnit.frontLotLine.min;
		const accFrontNote = setbacks.accessoryDwellingUnit.frontLotLine.note;
		html += `<td>${accFront}m${accFrontNote ? ' (' + accFrontNote + ')' : ''}</td>`;
	  } else {
		html += '<td>-</td>';
	  }
	  html += '</tr>';
	  
	  // Rear setback
	  html += '<tr><td>Rear</td>';
	  if (setbacks.principalBuilding && setbacks.principalBuilding.rearLotLine) {
		html += `<td>${setbacks.principalBuilding.rearLotLine.min}m</td>`;
	  } else {
		html += '<td>-</td>';
	  }
	  
	  if (setbacks.accessoryDwellingUnit && setbacks.accessoryDwellingUnit.rearLotLine) {
		html += `<td>${setbacks.accessoryDwellingUnit.rearLotLine.min}m</td>`;
	  } else {
		html += '<td>-</td>';
	  }
	  html += '</tr>';
	  
	  // Side setback
	  html += '<tr><td>Side (Interior)</td>';
	  if (setbacks.principalBuilding && setbacks.principalBuilding.sideInteriorLotLine) {
		html += `<td>${setbacks.principalBuilding.sideInteriorLotLine.min}m</td>`;
	  } else {
		html += '<td>-</td>';
	  }
	  
	  if (setbacks.accessoryDwellingUnit && setbacks.accessoryDwellingUnit.sideInteriorLotLine) {
		html += `<td>${setbacks.accessoryDwellingUnit.sideInteriorLotLine.min}m</td>`;
	  } else {
		html += '<td>-</td>';
	  }
	  html += '</tr>';
	  
	  // Side street setback (corner lot)
	  html += '<tr><td>Side (Street)</td>';
	  
	  // Use arterial road setbacks if specified
	  if (isArterialRoad && setbacks.principalBuilding && setbacks.principalBuilding.sideCollectorOrArterialStreet) {
		html += `<td>${setbacks.principalBuilding.sideCollectorOrArterialStreet.min}m</td>`;
	  } else if (setbacks.principalBuilding && setbacks.principalBuilding.sideInteriorOrLaneOrLocalStreet) {
		html += `<td>${setbacks.principalBuilding.sideInteriorOrLaneOrLocalStreet.min}m</td>`;
	  } else {
		html += '<td>-</td>';
	  }
	  
	  if (isArterialRoad && setbacks.accessoryDwellingUnit && setbacks.accessoryDwellingUnit.sideCollectorOrArterialStreet) {
		html += `<td>${setbacks.accessoryDwellingUnit.sideCollectorOrArterialStreet.min}m</td>`;
	  } else if (setbacks.accessoryDwellingUnit && setbacks.accessoryDwellingUnit.sideInteriorOrLaneOrLocalStreet) {
		html += `<td>${setbacks.accessoryDwellingUnit.sideInteriorOrLaneOrLocalStreet.min}m</td>`;
	  } else {
		html += '<td>-</td>';
	  }
	  html += '</tr>';
	}
	
	return html;
  }
  
  /**
   * Generate corner lot sight triangle information HTML
   * 
   * @return {string} HTML for corner lot sight triangle information
   */
  function generateCornerLotTriangleInfo() {
	let html = '<h5>Corner Lot Sight Triangle</h5>';
	html += '<table class="table table-sm">';
	html += '<tbody>';
	
	if (appState.isArterialRoad && ssmuhRules.setbacks.generalProvisions.cornerLotSightTriangle.arterialOrCollectorStreet) {
	  const distance = ssmuhRules.setbacks.generalProvisions.cornerLotSightTriangle.arterialOrCollectorStreet.distance;
	  html += `<tr><td>Building Restriction Area</td><td>${distance}m from projected lot lines</td></tr>`;
	} else if (ssmuhRules.setbacks.generalProvisions.cornerLotSightTriangle.localStreetOrLane) {
	  const distance = ssmuhRules.setbacks.generalProvisions.cornerLotSightTriangle.localStreetOrLane.distance;
	  html += `<tr><td>Building Restriction Area</td><td>${distance}m from projected lot lines</td></tr>`;
	}
	
	html += '</tbody></table>';
	return html;
  }
  
  /**
   * Generate height restrictions table HTML
   * 
   * @return {string} HTML for height restrictions table
   */
  function generateHeightRestrictionsTable() {
	let html = '<h4>Height Restrictions</h4>';
	html += '<table class="table table-sm">';
	html += '<tbody>';
	html += `<tr><td>Standard Dwelling Units</td><td>${ssmuhRules.heightRestrictions.allOtherDwellingUnits.maxHeight}m</td></tr>`;
	html += `<tr><td>Infill Housing Near Rear Lot Line</td><td>${ssmuhRules.heightRestrictions.infillHousingNearRearLotLine.maxHeight}m</td></tr>`;
	html += `<tr><td>Accessory Non-Dwelling Structures</td><td>${ssmuhRules.heightRestrictions.accessoryNonDwellingStructures.maxHeight}m</td></tr>`;
	html += '</tbody></table>';
	return html;
  }

/**
 * Generate third storey restrictions table HTML
 * 
 * @param {string} zoneType The zone type
 * @return {string} HTML for third storey restrictions table
 */
function generateThirdStoreyRestrictionsTable(zoneType) {
	let html = '<h4>Third Storey Restrictions</h4>';
	html += '<table class="table table-sm">';
	html += '<tbody>';
	
	if (zoneType === 'R-CL' || zoneType === 'R-CLA' || zoneType === 'R-CLB' || zoneType === 'R-CLCH') {
	// Compact lot zones have different third storey rules
	if (appState.zoneInfo && appState.zoneInfo.thirdStoreyRestrictions) {
		html += `<tr><td>1-2 Dwelling Units</td><td>${appState.zoneInfo.thirdStoreyRestrictions.oneOrTwoDwellingUnits}</td></tr>`;
		html += `<tr><td>3-4 Dwelling Units</td><td>${appState.zoneInfo.thirdStoreyRestrictions.threeOrFourDwellingUnits}</td></tr>`;
	} else {
		html += `<tr><td>1-2 Dwelling Units</td><td>50% of first storey floor area</td></tr>`;
		html += `<tr><td>3-4 Dwelling Units</td><td>80% of first storey floor area</td></tr>`;
	}
	} else {
	// Standard zones
	html += `<tr><td>1-2 Dwelling Units</td><td>${ssmuhRules.thirdStoreyRestrictions.oneOrTwoDwellingUnits.note}</td></tr>`;
	html += `<tr><td>3 Dwelling Units</td><td>${ssmuhRules.thirdStoreyRestrictions.threeDwellingUnits.maxFloorArea}% of first storey floor area</td></tr>`;
	html += `<tr><td>4 Dwelling Units</td><td>${ssmuhRules.thirdStoreyRestrictions.fourDwellingUnits.maxFloorArea}% of first storey floor area</td></tr>`;
	}
	
	html += '</tbody></table>';
	return html;
}

/**
 * Generate lot coverage information HTML
 * 
 * @param {string} zoneType The zone type
 * @return {string} HTML for lot coverage information
 */
function generateLotCoverageInfo(zoneType) {
	let html = '<h4>Lot Coverage</h4>';
	
	if (zoneType === 'R-CL' || zoneType === 'R-CLA' || zoneType === 'R-CLB' || zoneType === 'R-CLCH') {
	  html += '<p><strong>Compact Lot Zone Rules:</strong></p>';
	  html += '<ul>';
	  html += `<li>Small lots (≤ ${ssmuhRules.compactLotZones.lotAreaThresholds.small.maxAreaM2}m²): ${ssmuhRules.compactLotZones.lotAreaThresholds.small.maxBuildingCoverage}% max coverage</li>`;
	  html += `<li>Standard lots (> ${ssmuhRules.compactLotZones.lotAreaThresholds.small.maxAreaM2}m²): ${ssmuhRules.compactLotZones.lotAreaThresholds.standard.maxBuildingCoverage}% standard, ${ssmuhRules.compactLotZones.lotAreaThresholds.standard.withInfillHousingCoverage}% with infill housing</li>`;
	  html += '</ul>';
	} else {
	  html += '<ul>';
	  html += `<li>Standard: ${ssmuhRules.lotCoverage.standard.maxCoverage}% of lot area</li>`;
	  html += `<li>With Infill Housing: ${ssmuhRules.lotCoverage.withInfillHousing.maxCoverage}% of lot area</li>`;
	  html += '</ul>';
	}
	
	return html;
  }
  
  /**
   * Generate arterial road information HTML
   * 
   * @return {string} HTML for arterial road information
   */
  function generateArterialRoadInfo() {
	let html = '<h4>Arterial Road Considerations</h4>';
	html += '<ul>';
	html += '<li><strong>Board of Variance approval required</strong> for vehicular access on arterial road</li>';
	html += '<li>Larger setbacks required for buildings facing arterial road</li>';
	html += '</ul>';
	
	return html;
  }
  
  /**
   * Initialize the UI event handlers
   */
  function initEligibilityUI() {
	// Add event listener for arterial road checkbox
	const arterialRoadCheckbox = document.getElementById('isArterialRoad');
	if (arterialRoadCheckbox) {
	  arterialRoadCheckbox.addEventListener('change', function() {
		const arterialWarning = document.getElementById('arterialWarning');
		if (arterialWarning) {
		  arterialWarning.style.display = this.checked ? 'block' : 'none';
		}
	  });
	}
	
	// Add event listener for eligibility check button
	const checkButton = document.getElementById('checkEligibility');
	if (checkButton) {
	  checkButton.addEventListener('click', checkEligibility);
	}
  }
  
  /**
   * Render the summary of eligibility criteria in the UI
   */
  function renderEligibilitySummary() {
	const summaryContainer = document.getElementById('eligibilitySummary');
	if (!summaryContainer) return;
	
	// Get eligibility criteria
	const criteria = ssmuhRules.smallScaleMultiUnitHousing.eligibilityCriteria;
	
	let html = '<h4>Eligibility Requirements Summary</h4>';
	html += '<ul class="list-group">';
	
	// Required conditions
	criteria.requiredConditions.forEach(condition => {
	  html += `<li class="list-group-item">${condition.condition}</li>`;
	});
	
	// Lot size limits
	html += `<li class="list-group-item">Maximum lot size: ${criteria.maxLotSizeM2} m²</li>`;
	html += `<li class="list-group-item">Maximum units: ${criteria.maxUnits} (${criteria.maxUnitsIfSmallLot} for lots ≤ ${criteria.smallLotThresholdM2} m²)</li>`;
	
	html += '</ul>';
	
	summaryContainer.innerHTML = html;
  }
  
  /**
   * Update visual styling of form based on validation
   */
  function updateFormValidationStyles() {
	// Get all required input fields
	const requiredFields = document.querySelectorAll('input[required], select[required]');
	
	// Check each field
	requiredFields.forEach(field => {
	  const isValid = field.checkValidity();
	  
	  if (isValid) {
		field.classList.remove('is-invalid');
		field.classList.add('is-valid');
	  } else {
		field.classList.remove('is-valid');
		field.classList.add('is-invalid');
	  }
	});
  }
  
  /**
   * Add tooltip explanations to form elements
   */
  function addFormTooltips() {
	// Add tooltips to help explain form elements
	const tooltipElements = [
	  {
		id: 'isArterialRoad',
		title: 'Properties on arterial roads require Board of Variance approval for vehicular access'
	  },
	  {
		id: 'isCornerLot',
		title: 'Corner lots have special setback and sight triangle requirements'
	  },
	  {
		id: 'withinUCB',
		title: 'The Urban Containment Boundary defines areas for urban development'
	  },
	  {
		id: 'hasHeritage',
		title: 'Properties with heritage designation from before Dec 7, 2023 are not eligible for SSMUH'
	  },
	  {
		id: 'inWillowbrook',
		title: 'Properties in the Willowbrook Transit-Oriented Area have different development rules'
	  }
	];
	
	// Initialize tooltips (requires Bootstrap JS)
	tooltipElements.forEach(item => {
	  const element = document.getElementById(item.id);
	  if (element) {
		element.setAttribute('data-bs-toggle', 'tooltip');
		element.setAttribute('data-bs-placement', 'right');
		element.setAttribute('title', item.title);
	  }
	});
  }
  
  // Export functions
  window.displayEligibilityResult = displayEligibilityResult;
  window.displayZoneInfo = displayZoneInfo;
  window.initEligibilityUI = initEligibilityUI;
  window.renderEligibilitySummary = renderEligibilitySummary;
  window.updateFormValidationStyles = updateFormValidationStyles;
  window.addFormTooltips = addFormTooltips;