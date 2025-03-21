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
              <option value="secondary">Principal Dwelling w/ Secondary Suite</option>
              <option value="accessoryDwellingUnit">Accessory Dwelling Unit</option>
              <option value="coach">Coach House</option>
              <option value="garage">Detached Garage</option>
              <option value="multiplex">Multiplex</option>
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
            <input type="number" class="form-control" id="structureUnits" min="0" max="4" value="1" required>
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