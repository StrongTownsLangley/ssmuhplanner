<?php
/**
 * SSMUH Planner - Main Entry Point
 * 
 * This file serves as the main entry point for the SSMUH Planning Tool
 * when used as a standalone application.
 */

// Configuration and setup
require_once 'config.php';
require_once 'functions.php';

// Determine if being included from main site or run standalone
$isStandalone = !defined('SSMUH_INCLUDED');
if(!defined('SSMUH_PATH_PREFIX'))
{
  define("SSMUH_PATH_PREFIX","");
}

// Load zoning bylaw data
$ssmuhRules = json_decode(file_get_contents(__DIR__ . '/data/ssmuh-zoning-bylaw.json'), true);

// If running standalone, output the full HTML structure
if ($isStandalone) {
    echo '<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Township of Langley SSMUH Planning Tool</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="assets/css/main.css" rel="stylesheet">
    <link href="assets/css/mobile.css" rel="stylesheet">
</head>
<body>
';
}
?>

<br />
<div class="container">  
<script>
// Make SSMUH rules available to JavaScript
const ssmuhRules = <?php echo json_encode($ssmuhRules); ?>;
</script>

<div class="row">
  <div class="col-md-12">
    <div class="card mb-4">
      <div class="card-header">
      <h3>What is Small-Scale Multi Unit Housing (SSMUH)?</h3>
      </div>
      <div class="card-body">
        <img src="<?php echo SSMUH_PATH_PREFIX . 'assets/img/Examples-of-Small-Scale-Multi-Unit-Housing.png' ?>" style="display: block; width: 50%; margin-left: auto; margin-right: auto;" />
        <p>Small-Scale Multi Unit Housing (SSMUH) is the framework developed by the Government of British Columbia to unlock more units of housing within existing towns and cities. On parcels of land originally restricted to just one or two units of housing, SSMUH allows up to four units* of housing on one traditionally <i>"single family"</i> parcel.</p>
        <p>In November 2024 the Township of Langley officially adopted this SSMUH framework making it possible to apply for permits to build SSMUH-compliant developments.</p>
        <p>You can build something as simple as a small Garden Suite in your backyard for your kids or in-laws, a Coach house above a detached garage as a rental unit, or even tear down an old home to build a brand new multiplex unit on the property.</p>
        <p>You can learn more about this legislation on the <a href="https://www2.gov.bc.ca/gov/content/housing-tenancy/local-governments-and-housing/housing-initiatives/smale-scale-multi-unit-housing" target="_blank">Government of British Columbia website</a>.</p>
        <h4>Key Requirements in the Township of Langley:</h4>
        <ul>
          <li>Maximum <?php echo $ssmuhRules['smallScaleMultiUnitHousing']['eligibilityCriteria']['maxUnits']; ?> units* (<?php echo $ssmuhRules['smallScaleMultiUnitHousing']['eligibilityCriteria']['maxUnitsIfSmallLot']; ?> units if lot is smaller than <?php echo $ssmuhRules['smallScaleMultiUnitHousing']['eligibilityCriteria']['smallLotThresholdM2']; ?> m²)</li>
          <li>Maximum lot size: <?php echo $ssmuhRules['smallScaleMultiUnitHousing']['eligibilityCriteria']['maxLotSizeM2']; ?> m²</li>
          <?php foreach($ssmuhRules['smallScaleMultiUnitHousing']['eligibilityCriteria']['requiredConditions'] as $condition): ?>
            <?php if($condition['required']): ?>
              <li><?php echo $condition['condition']; ?></li>
            <?php endif; ?>
          <?php endforeach; ?>
          <li>Vehicular access to a lot must not be to an arterial road as identified in the Master Transportation Plan or Official Community Plan**.</li>
        </ul>
        
        <p class="mt-3"><small class="text-muted">Based on: <a href="<?php echo SSMUH_PATH_PREFIX . 'sources/2024-11-18 Langley (Township) SSMUH Bylaw.pdf' ?>" target="_blank"><?php echo $ssmuhRules['bylaw']['name']; ?></a> and <a href="<?php echo SSMUH_PATH_PREFIX . 'sources/2024-11-18 Council Meeting Minutes.pdf'?>" target="_blank">arterial road amendment</a>.</small></p>
        <p class="mt-3"><small class="text-muted">* Up to six units near frequent transit, however no areas in the Township of Langley currently qualify.</small></p>
        <p class="mt-3"><small class="text-muted">** May be waivable with Board of Variance approval.</small></p>
      </div>
    </div>
    <div class="card mb-4">
      <div class="card-header">
      <h3>Introducing the Unofficial Township of Langley SSMUH Planning Tool</h3>
      </div>
      <div class="card-body">  
        <p>We have created this planning tool to help aspiring homeowners, builders and developers figure out what is now possible on various types of single family lots throughout the Township of Langley based on the current bylaws in place.</p>     
        <p>This tool is unofficial and the results of this tool are provided for <b><u>guidance only</u></b> and may not be accurate, please verify with Township of Langley staff before applying to build SSMUH unit(s). You can find their contact information on the <a href="https://www.tol.ca/en/the-township/small-scale-multi-unit-housing.aspx" target="_blank">official SSMUH page on the Township of Langley website</a>. <b>We are not liable or responsible for your project or for any expenses incurred</b>.</p>
        <p>However we are happy to try and answer questions or receive feedback on this planning tool, email <a href="mailto:james@strongtownslangley.org">james@strongtownslangley.org</a> or join our <a href="https://discord.gg/MuAn3cFd8J" target="_blank">discord chat</a> and ask in the #🧮do-the-math channel.</p>


        <p class="mt-3"><small class="text-muted">Source code is available on our <a href="https://github.com/StrongTownsLangley/ssmuhplanner/" target="_blank">GitHub Repository</a>.</small></p>
      </div>
    </div>
  </div>
</div>

<!-- Eligibility Check Section -->
<div id="eligibility-section">
<?php include __DIR__ . '/php_code/eligibility-form-content.php'; ?>
</div>

<!-- Lot Builder Section (initially greyed out) -->
<div id="lot-builder-section" class="disabled-section">
<?php include __DIR__ . '/php_code/lot-builder-content.php'; ?>
</div>

<!-- Zone Information Section (initially greyed out) -->
<div id="zone-info-section" class="disabled-section">
<?php include __DIR__ . '/php_code/zone-info-content.php'; ?>
</div>

<!-- Structure Modal -->
<?php include __DIR__ . '/php_code/structure-modal-content.php'; ?>

<?php
// Templates are now directly included in the DIVs above

// Load JS files at the end
if ($isStandalone) {
    echo '<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>';
}
?>
<script src="<?php echo SSMUH_PATH_PREFIX; ?>js_code/main.js"></script>
<script src="<?php echo SSMUH_PATH_PREFIX; ?>js_code/eligibility.js"></script>
<script src="<?php echo SSMUH_PATH_PREFIX; ?>js_code/eligibility-validation.js"></script>
<script src="<?php echo SSMUH_PATH_PREFIX; ?>js_code/eligibility-arterial-setbacks.js"></script>
<script src="<?php echo SSMUH_PATH_PREFIX; ?>js_code/eligibility-ui.js"></script>
<script src="<?php echo SSMUH_PATH_PREFIX; ?>js_code/lotCanvas.js"></script>
<script src="<?php echo SSMUH_PATH_PREFIX; ?>js_code/structures.js"></script>
<script src="<?php echo SSMUH_PATH_PREFIX; ?>js_code/structures-form.js"></script>
<script src="<?php echo SSMUH_PATH_PREFIX; ?>js_code/structures-list.js"></script>
<script src="<?php echo SSMUH_PATH_PREFIX; ?>js_code/structures-validation.js"></script>
<script src="<?php echo SSMUH_PATH_PREFIX; ?>js_code/zoneInfo.js"></script>

<?php if ($isStandalone): ?>
</div>
</body>
</html>
<?php else: ?>
</div>
<?php endif; ?>
