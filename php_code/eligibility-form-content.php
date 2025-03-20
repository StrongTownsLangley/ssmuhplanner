<div class="row">
    <div class="col-md-12">
      <div class="card mb-4">
        <div class="card-header">
          <h3>Lot Eligibility Check</h3>
        </div>
        <div class="card-body">
          <form id="eligibilityForm">
            <div class="row mb-3">
              <div class="col-md-6">
                <label for="lotWidth" class="form-label">Lot Width (metres)</label>
                <input type="number" class="form-control" id="lotWidth" min="0" step="0.01" required>
              </div>
              <div class="col-md-6">
                <label for="lotDepth" class="form-label">Lot Depth (metres)</label>
                <input type="number" class="form-control" id="lotDepth" min="0" step="0.01" required>
              </div>
            </div>
            
            <div class="row mb-3">
              <div class="col-md-6">
                <label for="zoneType" class="form-label">Zoning <i>(find out your zoning on <a href="https://geosource.tol.ca/" target="_blank">GeoSource</a>)</i></label>
                <select class="form-control" id="zoneType">
                  <option value="R1A">R1A (Standard Residential)</option>
                  <option value="R1B">R1B/C/D/E (Residential)</option>
                  <option value="R2">R2 (Two-Family Residential)</option>
                  <option value="R-CL">R-CL (Residential Compact Lot)</option>
                  <option value="R-CLA">R-CLA (Residential Compact Lot A)</option>
                  <option value="R-CLB">R-CLB (Residential Compact Lot B)</option>
                  <option value="R-CLCH">R-CLCH (Residential Compact Lot Coach House)</option>
                  <option value="SR1">SR1 (Suburban Residential)</option>
                  <option value="SR2">SR2 (Suburban Residential)</option>
                  <option value="SR3">SR3 (Suburban Residential)</option>
                  <option value="CD">CD (Comprehensive Development)</option>
                  <option value="other">Other</option>
                </select>
                <div class="form-text" id="zoneHelp"></div>
              </div>
              <div class="col-md-6">
                <label for="loadingType" class="form-label">Lot Access Type</label>
                <select class="form-control" id="loadingType">
                  <option value="front">Front-Loaded (Driveway from front street)</option>
                  <option value="rear">Rear-Loaded (Driveway from lane/rear)</option>
                </select>
              </div>
            </div>
            
            <div class="row mb-3">
              <div class="col-md-6">
                <div class="form-check">
                  <input class="form-check-input" type="checkbox" id="hasSewerService" checked>
                  <label class="form-check-label" for="hasSewerService">Has Municipal Sewer Service</label>
                </div>
                <div class="form-check">
                  <input class="form-check-input" type="checkbox" id="hasWaterService" checked>
                  <label class="form-check-label" for="hasWaterService">Has Municipal Water Service</label>
                </div>
                <div class="form-check">
                  <input class="form-check-input" type="checkbox" id="isCornerLot">
                  <label class="form-check-label" for="isCornerLot">Corner Lot</label>
                </div>
                <div class="form-check">
                  <input class="form-check-input" type="checkbox" id="isArterialRoad">
                  <label class="form-check-label" for="isArterialRoad">Is on an Arterial or Collector Road</label>
                </div>
              </div>
              <div class="col-md-6">
                <div class="form-check">
                  <input class="form-check-input" type="checkbox" id="withinUCB" checked>
                  <label class="form-check-label" for="withinUCB">Within Urban Containment Boundary <i>(Most Urban and Suburban neighbourhoods are within the boundary, check the <a href="https://strongtownslangley.org/maps" target="_blank">Where Can We Build map</a>)</i></label>
                </div>
                <div class="form-check">
                  <input class="form-check-input" type="checkbox" id="hasHeritage">
                  <label class="form-check-label" for="hasHeritage">Has Heritage Designation from before Dec 7, 2023</label>
                </div>
                <div class="form-check">
                  <input class="form-check-input" type="checkbox" id="inWillowbrook">
                  <label class="form-check-label" for="inWillowbrook">In Willowbrook Transit-Oriented Area</label>
                </div>
              </div>
            </div>
            
            <div id="arterialWarning" class="alert alert-warning mt-2 mb-3" style="display: none;">
              <strong>Warning:</strong> Properties with vehicular access on an arterial road are not eligible without Board of Variance approval (<a href="sources/2024-11-18 Council Meeting Minutes.pdf" target="_blank">November 18th 2025 Council Meeting Amendment</a>)
            </div>
            
            <button type="button" class="btn btn-primary" id="checkEligibility">Check Eligibility</button>
          </form>
          
          <div id="eligibilityResult" class="mt-3" style="display: none;">
            <div class="alert" role="alert" id="eligibilityAlert"></div>
          </div>
        </div>
      </div>
    </div>
  </div>