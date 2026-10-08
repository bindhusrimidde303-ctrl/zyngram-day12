// Geo-Mapping Service
// GPS -> Point -> Center -> Hub -> Command
// Includes audit-ready mapping records

const geoBoundaries = [
  {
    pointId: "P-102",
    centerId: "C-018",
    hubId: "H-005",
    commandId: "CMD-002",
    minLat: 17.00,
    maxLat: 17.30,
    minLng: 80.90,
    maxLng: 81.30
  }
];

const mappingAuditLog = [];

function validateCoordinates(latitude, longitude, accuracy) {
  if (
    typeof latitude !== "number" ||
    typeof longitude !== "number" ||
    typeof accuracy !== "number"
  ) {
    return {
      valid: false,
      message: "Latitude, longitude and accuracy must be numbers."
    };
  }

  if (latitude < -90 || latitude > 90) {
    return {
      valid: false,
      message: "Invalid latitude."
    };
  }

  if (longitude < -180 || longitude > 180) {
    return {
      valid: false,
      message: "Invalid longitude."
    };
  }

  if (accuracy < 0) {
    return {
      valid: false,
      message: "Invalid location accuracy."
    };
  }

  return {
    valid: true
  };
}

function reverseGeocode(latitude, longitude) {
  return {
    latitude,
    longitude,
    address: "Demo Location",
    city: "Rajamahendravaram",
    district: "East Godavari",
    state: "Andhra Pradesh",
    pinCode: "533101"
  };
}

function mapLocation(latitude, longitude, accuracy) {
  const validation = validateCoordinates(
    latitude,
    longitude,
    accuracy
  );

  if (!validation.valid) {
    const auditRecord = {
      event: "GEO_MAPPING",
      status: "INVALID",
      latitude,
      longitude,
      accuracy,
      reason: validation.message,
      timestamp: new Date().toISOString()
    };

    mappingAuditLog.push(auditRecord);

    return {
      status: "INVALID",
      message: validation.message
    };
  }

  const address = reverseGeocode(latitude, longitude);

  const matchedBoundary = geoBoundaries.find(
    (boundary) =>
      latitude >= boundary.minLat &&
      latitude <= boundary.maxLat &&
      longitude >= boundary.minLng &&
      longitude <= boundary.maxLng
  );

  if (!matchedBoundary) {
    const result = {
      status: "UNMAPPED",
      latitude,
      longitude,
      accuracy,
      address,
      mapping: null,
      mappedAt: new Date().toISOString()
    };

    mappingAuditLog.push({
      event: "GEO_MAPPING",
      status: "UNMAPPED",
      latitude,
      longitude,
      accuracy,
      reason: "No matching geographic boundary found.",
      timestamp: result.mappedAt
    });

    return result;
  }

  const result = {
    status: "MAPPED",
    latitude,
    longitude,
    accuracy,
    address,
    mapping: {
      pointId: matchedBoundary.pointId,
      centerId: matchedBoundary.centerId,
      hubId: matchedBoundary.hubId,
      commandId: matchedBoundary.commandId
    },
    mappingVersion: "GEO-V1",
    mappedAt: new Date().toISOString()
  };

  mappingAuditLog.push({
    event: "GEO_MAPPING",
    status: "MAPPED",
    latitude,
    longitude,
    accuracy,
    mapping: result.mapping,
    mappingVersion: result.mappingVersion,
    timestamp: result.mappedAt
  });

  return result;
}

function getMappingAuditLog() {
  return [...mappingAuditLog];
}

module.exports = {
  mapLocation,
  validateCoordinates,
  reverseGeocode,
  getMappingAuditLog
};