<?php
/**
 * SSMUH Planner - Shared Functions
 * 
 * This file contains shared functions used throughout the application.
 */

/**
 * Capitalize the first letter of a string
 * 
 * @param string $str The string to capitalize
 * @return string The capitalized string
 */
function capitalize($str) {
    return ucfirst($str);
}

/**
 * Get setbacks for a specific zone
 * 
 * @param string $zoneType The zone type
 * @param string $loadingType The loading type ('front' or 'rear')
 * @param array $ssmuhRules The SSMUH rules
 * @return array The setbacks for the specified zone and loading type
 */
function getSetbacksForZone($zoneType, $loadingType, $ssmuhRules) {
    $loadType = $loadingType === 'front' ? 'frontLoadedLot' : 'rearLoadedLot';
    
    if ($zoneType === 'R1A' && isset($ssmuhRules['setbacks']) && isset($ssmuhRules['setbacks']['zoneR1A'])) {
        return $ssmuhRules['setbacks']['zoneR1A'][$loadType];
    } else if (in_array($zoneType, ['R1B', 'R1C', 'R1D', 'R1E']) && 
            isset($ssmuhRules['setbacks']) && isset($ssmuhRules['setbacks']['residentialZones']) && 
            isset($ssmuhRules['setbacks']['residentialZones']['R1B_R1C_R1D_R1E'])) {
        return $ssmuhRules['setbacks']['residentialZones']['R1B_R1C_R1D_R1E'][$loadType];
    } else if ($zoneType === 'R-CL' && isset($ssmuhRules['setbacks']) && isset($ssmuhRules['setbacks']['residentialZones']) && 
            isset($ssmuhRules['setbacks']['residentialZones']['compactLotR_CL'])) {
        return $ssmuhRules['setbacks']['residentialZones']['compactLotR_CL'][$loadType];
    } else {
        // Default to R1A setbacks if specific zone not found
        return isset($ssmuhRules['setbacks']['zoneR1A'][$loadType]) ? 
            $ssmuhRules['setbacks']['zoneR1A'][$loadType] : [];
    }
}

/**
 * Check if a zone allows SSMUH
 * 
 * @param string $zoneType The zone type
 * @param array $ssmuhRules The SSMUH rules
 * @return boolean Whether the zone allows SSMUH
 */
function zoneAllowsSSMUH($zoneType, $ssmuhRules) {
    if ($zoneType === 'R1A' && isset($ssmuhRules['zoningAreas']) && isset($ssmuhRules['zoningAreas']['residentialZones'])) {
        return isset($ssmuhRules['zoningAreas']['residentialZones']['R1A']['allowsSSMUH']) ? 
            $ssmuhRules['zoningAreas']['residentialZones']['R1A']['allowsSSMUH'] : false;
    } else if (strpos($zoneType, 'R1') === 0 && isset($ssmuhRules['zoningAreas']) && isset($ssmuhRules['zoningAreas']['residentialZones'])) {
        return isset($ssmuhRules['zoningAreas']['residentialZones']['R1B_R1C_R1D_R1E']['allowsSSMUH']) ? 
            $ssmuhRules['zoningAreas']['residentialZones']['R1B_R1C_R1D_R1E']['allowsSSMUH'] : false;
    } else if ($zoneType === 'R2' && isset($ssmuhRules['zoningAreas']) && isset($ssmuhRules['zoningAreas']['residentialZones'])) {
        return isset($ssmuhRules['zoningAreas']['residentialZones']['R2']['allowsSSMUH']) ? 
            $ssmuhRules['zoningAreas']['residentialZones']['R2']['allowsSSMUH'] : false;
    } else if ($zoneType === 'R-CL' && isset($ssmuhRules['zoningAreas']) && isset($ssmuhRules['zoningAreas']['residentialZones'])) {
        return isset($ssmuhRules['zoningAreas']['residentialZones']['R_CL']['allowsSSMUH']) ? 
            $ssmuhRules['zoningAreas']['residentialZones']['R_CL']['allowsSSMUH'] : false;
    } else if (strpos($zoneType, 'SR') === 0 && isset($ssmuhRules['zoningAreas']) && isset($ssmuhRules['zoningAreas']['suburbanResidential'])) {
        $zoneInfo = isset($ssmuhRules['zoningAreas']['suburbanResidential'][$zoneType]) ? 
            $ssmuhRules['zoningAreas']['suburbanResidential'][$zoneType] : null;
        return $zoneInfo && isset($zoneInfo['allowsSSMUH']) ? $zoneInfo['allowsSSMUH'] : false;
    } else if ($zoneType === 'CD' && isset($ssmuhRules['zoningAreas']) && isset($ssmuhRules['zoningAreas']['comprehensiveDevelopmentZones'])) {
        // CD zones require specific CD zone number check
        return true;
    }
    
    return false;
}

/**
 * Debug function to log messages if debug mode is enabled
 * 
 * @param mixed $message The message to log
 * @return void
 */
function ssmuh_debug($message) {
    if (defined('SSMUH_PLANNER_DEBUG') && SSMUH_PLANNER_DEBUG) {
        if (is_array($message) || is_object($message)) {
            error_log(print_r($message, true));
        } else {
            error_log($message);
        }
    }
}
