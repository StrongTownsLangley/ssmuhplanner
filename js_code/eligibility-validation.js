/**
 * SSMUH Planner - Eligibility Validation Module
 * 
 * This module handles the validation of property eligibility for SSMUH.
 */

/**
 * Check if a property is eligible for SSMUH based on form input
 * 
 * @return {object} Eligibility result containing status and messages
 */
function validateEligibility() {
	// Get form values
	const hasSewerService = document.getElementById('hasSewerService').checked;
	const hasWaterService = document.getElementById('hasWaterService').checked;
	const withinUCB = document.getElementById('withinUCB').checked;
	const hasHeritage = document.getElementById('hasHeritage').checked;
	const inWillowbrook = document.getElementById('inWillowbrook').checked;
	
	// Get eligibility criteria from JSON
	const eligibilityCriteria = ssmuhRules.smallScaleMultiUnitHousing.eligibilityCriteria;
	const maxLotSize = eligibilityCriteria.maxLotSizeM2;
	
	// Prepare result object
	let result = {
	  isEligible: true,
	  zoneAllowsSSMUH: true,
	  hasWarnings: false,
	  eligibilityMessage: '',
	  warningMessage: ''
	};
	
	// Check arterial road warning
	if (appState.isArterialRoad) {
	  result.hasWarnings = true;
	  result.warningMessage += 'Board of Variance approval is required if vehicular access is from an arterial road. ';
	}
	
	// Check required services
	if (!hasSewerService) {
	  result.isEligible = false;
	  result.eligibilityMessage += 'Municipal sewer service is required. ';
	}
	
	if (!hasWaterService) {
	  result.isEligible = false;
	  result.eligibilityMessage += 'Municipal water service is required. ';
	}
	
	// Check location requirements
	if (!withinUCB) {
	  result.isEligible = false;
	  result.eligibilityMessage += 'Property must be within urban containment boundary. ';
	}
	
	if (hasHeritage) {
	  result.isEligible = false;
	  result.eligibilityMessage += 'Property with heritage designation before Dec 7, 2023 is not eligible. ';
	}
	
	if (inWillowbrook) {
	  result.isEligible = false;
	  result.eligibilityMessage += 'Properties in Willowbrook Transit-Oriented Area are not eligible. ';
	}
	
	// Check lot size
	if (appState.lotAreaM2 > maxLotSize) {
	  result.isEligible = false;
	  result.eligibilityMessage += `Lot size exceeds maximum of ${maxLotSize} m². `;
	}
	
	// Check zone-specific eligibility
	result.zoneAllowsSSMUH = checkZoneEligibility(appState.zoneType);
	if (!result.zoneAllowsSSMUH) {
	  result.isEligible = false;
	  result.eligibilityMessage += `SSMUH is not allowed in ${appState.zoneType} zone. `;
	}
	
	return result;
  }
  
  /**
   * Check if a specific zone allows SSMUH
   * 
   * @param {string} zoneType The zone type
   * @return {boolean} True if the zone allows SSMUH, false otherwise
   */
  function checkZoneEligibility(zoneType) {
	// Check for SR2 zone which doesn't allow SSMUH
	if (zoneType === 'SR2') {
	  return false;
	}
	
	// Check suburban residential zones
	if (zoneType.startsWith('SR') && ssmuhRules.zoningAreas && ssmuhRules.zoningAreas.suburbanResidential) {
	  const zoneSR = ssmuhRules.zoningAreas.suburbanResidential[zoneType];
	  if (zoneSR && !zoneSR.allowsSSMUH) {
		return false;
	  }
	}
	
	// Check comprehensive development zones
	if (zoneType === 'CD' && ssmuhRules.zoningAreas && ssmuhRules.zoningAreas.comprehensiveDevelopmentZones) {
	  const allowedCDZones = ssmuhRules.zoningAreas.comprehensiveDevelopmentZones.allowedInZones;
	  // For CD zones, we would need specific CD zone number to check, 
	  // but for the form we're treating all CD as potentially eligible
	  return true;
	}
	
	// For all other zones, assume they allow SSMUH
	return true;
  }
  
  /**
   * Check eligibility based on form input and update application state
   */
  function checkEligibility() {
	// Update application state from form
	updateAppStateFromForm();
	
	// Validate eligibility
	const eligibilityResult = validateEligibility();
	
	// Update the UI based on the validation result
	displayEligibilityResult(eligibilityResult);
  }
  
  /**
   * Update application state from form values
   */
  function updateAppStateFromForm() {
	appState.lotWidth = parseFloat(document.getElementById('lotWidth').value) || 0;
	appState.lotDepth = parseFloat(document.getElementById('lotDepth').value) || 0;
	appState.zoneType = document.getElementById('zoneType').value;
	appState.loadingType = document.getElementById('loadingType').value;
	appState.isCornerLot = document.getElementById('isCornerLot').checked;
	appState.isArterialRoad = document.getElementById('isArterialRoad').checked;
	
	// Calculate derived values
	appState.lotAreaM2 = appState.lotWidth * appState.lotDepth;
	appState.maxUnits = calculateMaxUnits();
	appState.zoneInfo = getZoneInfo(appState.zoneType);
	appState.setbacks = getSetbacksForZone(appState.zoneType, appState.loadingType);
  }
  
  // Export functions
  window.checkEligibility = checkEligibility;
  window.validateEligibility = validateEligibility;
  window.checkZoneEligibility = checkZoneEligibility;
  window.updateAppStateFromForm = updateAppStateFromForm;