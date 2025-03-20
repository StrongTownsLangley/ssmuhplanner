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
$isStandalone = !defined('INCLUDED_FROM_MAIN_SITE');

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
      <h3>Township of Langley SSMUH Planning Tool Introduction</h3>
      </div>
      <div class="card-body">        
        <p>Small-Scale Multi-Unit Housing (SSMUH) allows for up to four dwelling units (attached or detached) on a single lot, subject to certain conditions.</p>
        <p>This planning tool has been created to help figuring out what is now possible on various types of single family lots. Source code is available on our <a href="https://github.com/StrongTownsLangley/ssmuhplanner/" target="_blank">GitHub Repository</a>.
        <p>Based on the current <a href="<?php echo $isStandalone ? 'sources/2024-11-18 Langley (Township) SSMUH Bylaw.pdf' : '/ssmuhplanner/sources/2024-11-18 Langley (Township) SSMUH Bylaw.pdf'; ?>" target="_blank">Township of Langley SSMUH Bylaw</a> (and <a href="<?php echo $isStandalone ? 'sources/2024-11-18 Council Meeting Minutes.pdf' : '/ssmuhplanner/sources/2024-11-18 Council Meeting Minutes.pdf'; ?>" target="_blank">arterial road amendment</a> upon adoption).</p>        
        <p style="font-weight:bold">Note: This is just provided for guidance only and may not be 100% accurate, please verify with Township of Langley staff before applying to build SSMUH unit(s). You can also find information on the <a href="https://www.tol.ca/en/the-township/small-scale-multi-unit-housing.aspx" target="_blank">official SSMUH page on the Township of Langley website</a>.</p>

        <h4>Key Requirements:</h4>
        <ul>
          <li>Maximum <?php echo $ssmuhRules['smallScaleMultiUnitHousing']['eligibilityCriteria']['maxUnits']; ?> units (<?php echo $ssmuhRules['smallScaleMultiUnitHousing']['eligibilityCriteria']['maxUnitsIfSmallLot']; ?> units if lot is smaller than <?php echo $ssmuhRules['smallScaleMultiUnitHousing']['eligibilityCriteria']['smallLotThresholdM2']; ?> m²)</li>
          <li>Maximum lot size: <?php echo $ssmuhRules['smallScaleMultiUnitHousing']['eligibilityCriteria']['maxLotSizeM2']; ?> m²</li>
          <?php foreach($ssmuhRules['smallScaleMultiUnitHousing']['eligibilityCriteria']['requiredConditions'] as $condition): ?>
            <?php if($condition['required']): ?>
              <li><?php echo $condition['condition']; ?></li>
            <?php endif; ?>
          <?php endforeach; ?>
        </ul>
        
        <p class="mt-3"><small class="text-muted">Based on: <?php echo $ssmuhRules['bylaw']['name']; ?></small></p>
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
<div class="modal fade" id="structureModal" tabindex="-1" aria-hidden="true">
  <div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title">Add Structure</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div class="modal-body">
        <form id="structureForm">
          <div class="mb-3">
            <label for="structureType" class="form-label">Structure Type</label>
            <select class="form-control" id="structureType">
              <option value="principal">Principal Dwelling</option>
              <option value="secondary">Secondary Suite</option>
              <option value="infill">Infill Housing</option>
              <option value="accessory">Accessory Dwelling Unit</option>
              <option value="coach">Coach House</option>
              <option value="garage">Detached Garage</option>
              <option value="other">Other Structure</option>
            </select>
            <div class="form-text small" id="structureTypeHelp"></div>
          </div>
          <div class="mb-3">
            <label for="structureWidth" class="form-label">Width (metres)</label>
            <input type="number" class="form-control" id="structureWidth" min="1" step="0.1" required>
          </div>
          <div class="mb-3">
            <label for="structureDepth" class="form-label">Depth (metres)</label>
            <input type="number" class="form-control" id="structureDepth" min="1" step="0.1" required>
          </div>
          <div class="mb-3">
            <label for="structureStories" class="form-label">Number of Stories</label>
            <select class="form-control" id="structureStories">
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
            </select>
            <div class="form-text small" id="storiesHelp"></div>
          </div>
          <div class="mb-3">
            <label for="structureUnits" class="form-label">Number of Units</label>
            <input type="number" class="form-control" id="structureUnits" min="1" max="4" value="1" required>
          </div>
          <input type="hidden" id="structureId" value="">
          <input type="hidden" id="editMode" value="add">
          <div class="alert alert-info small">
            <strong>Note:</strong> Structures must respect setback requirements and height restrictions based on the bylaw.
          </div>
        </form>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
        <button type="button" class="btn btn-primary" id="saveStructure">Add</button>
      </div>
    </div>
  </div>
</div>

<?php
// Templates are now directly included in the DIVs above

// Load JS files at the end
if ($isStandalone) {
    echo '<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>';
}
?>
<script src="<?php echo $isStandalone ? '' : 'ssmuhplanner/'; ?>js_code/main.js"></script>
<script src="<?php echo $isStandalone ? '' : 'ssmuhplanner/'; ?>js_code/eligibility.js"></script>
<script src="<?php echo $isStandalone ? '' : 'ssmuhplanner/'; ?>js_code/eligibility-validation.js"></script>
<script src="<?php echo $isStandalone ? '' : 'ssmuhplanner/'; ?>js_code/eligibility-arterial-setbacks.js"></script>
<script src="<?php echo $isStandalone ? '' : 'ssmuhplanner/'; ?>js_code/eligibility-ui.js"></script>
<script src="<?php echo $isStandalone ? '' : 'ssmuhplanner/'; ?>js_code/lotCanvas.js"></script>
<script src="<?php echo $isStandalone ? '' : 'ssmuhplanner/'; ?>js_code/structures.js"></script>
<script src="<?php echo $isStandalone ? '' : 'ssmuhplanner/'; ?>js_code/structures-form.js"></script>
<script src="<?php echo $isStandalone ? '' : 'ssmuhplanner/'; ?>js_code/structures-list.js"></script>
<script src="<?php echo $isStandalone ? '' : 'ssmuhplanner/'; ?>js_code/structures-validation.js"></script>
<script src="<?php echo $isStandalone ? '' : 'ssmuhplanner/'; ?>js_code/zoneInfo.js"></script>

<?php if ($isStandalone): ?>
</div>
</body>
</html>
<?php else: ?>
</div>
<?php endif; ?>
