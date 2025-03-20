
  <div class="row">
    <div class="col-md-12">
      <div class="card mb-4" id="lotBuilderCard">
        <div class="card-header">
          <h3>Lot Layout Builder</h3>
        </div>
        <div class="card-body">
          <div class="row">
            <div class="col-md-8">
              <div id="lotCanvas" style="border: 2px solid #333; position: relative; min-height: 400px;">
                <!-- Lot canvas will be rendered here -->
              </div>
            </div>
            <div class="col-md-4">
              <div id="lotStats">
                <h4>Lot Information</h4>
                <p>Area: <span id="lotArea">0</span> m²</p>
                <p>Maximum Units: <span id="maxUnits">0</span></p>
                <p>Building Coverage: <span id="buildingCoverage">0</span>%</p>
                <p>Maximum Coverage: <span id="maxCoverage">35</span>%</p>
                <p>Required Parking: <span id="requiredParking">0</span> spaces</p>
                <p>Zone: <span id="zoneName"></span></p>
              </div>
              
              <div class="mt-3">
                <button type="button" class="btn btn-success mb-2" id="addStructure">Add Structure</button>
                <div id="structuresList"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
