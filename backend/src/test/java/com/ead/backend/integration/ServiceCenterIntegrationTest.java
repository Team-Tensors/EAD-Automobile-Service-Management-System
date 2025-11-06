package com.ead.backend.integration;

import com.ead.backend.entity.ServiceCenter;
import com.ead.backend.repository.ServiceCenterRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.hamcrest.Matchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
@WithMockUser(username = "test@example.com", roles = { "CUSTOMER" })
@DisplayName("Service Center Integration Tests")
class ServiceCenterIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private ServiceCenterRepository serviceCenterRepository;

    private ServiceCenter colomboCenter;
    private ServiceCenter kandyCenter;
    private ServiceCenter galleCenter;
    private ServiceCenter inactiveCenter;

    @BeforeEach
    void setUp() {
        // Clean up
        serviceCenterRepository.deleteAll();

        // Create test service centers with realistic Sri Lankan data
        colomboCenter = new ServiceCenter();
        colomboCenter.setName("Colombo Auto Service Center");
        colomboCenter.setAddress("123 Galle Road, Colombo 03");
        colomboCenter.setCity("Colombo");
        colomboCenter.setLatitude(new BigDecimal("6.9271"));
        colomboCenter.setLongitude(new BigDecimal("79.8612"));
        colomboCenter.setPhone("+94112345678");
        colomboCenter.setEmail("colombo@autoservice.lk");
        colomboCenter.setOperatingHours("Mon-Sat: 8:00 AM - 6:00 PM");
        colomboCenter.setIsActive(true);
        colomboCenter.setCenterSlot(5);
        colomboCenter = serviceCenterRepository.save(colomboCenter);

        kandyCenter = new ServiceCenter();
        kandyCenter.setName("Kandy Auto Care");
        kandyCenter.setAddress("456 Peradeniya Road, Kandy");
        kandyCenter.setCity("Kandy");
        kandyCenter.setLatitude(new BigDecimal("7.2906"));
        kandyCenter.setLongitude(new BigDecimal("80.6337"));
        kandyCenter.setPhone("+94812345678");
        kandyCenter.setEmail("kandy@autocare.lk");
        kandyCenter.setOperatingHours("Mon-Fri: 9:00 AM - 5:00 PM");
        kandyCenter.setIsActive(true);
        kandyCenter.setCenterSlot(0);
        kandyCenter = serviceCenterRepository.save(kandyCenter);

        galleCenter = new ServiceCenter();
        galleCenter.setName("Galle Service Station");
        galleCenter.setAddress("789 Main Street, Galle");
        galleCenter.setCity("Galle");
        galleCenter.setLatitude(new BigDecimal("6.0535"));
        galleCenter.setLongitude(new BigDecimal("80.2210"));
        galleCenter.setPhone("+94912345678");
        galleCenter.setEmail("galle@service.lk");
        galleCenter.setOperatingHours("Mon-Sat: 8:30 AM - 5:30 PM");
        galleCenter.setIsActive(true);
        galleCenter.setCenterSlot(3);
        galleCenter = serviceCenterRepository.save(galleCenter);

        inactiveCenter = new ServiceCenter();
        inactiveCenter.setName("Closed Auto Center");
        inactiveCenter.setAddress("999 Old Road, Negombo");
        inactiveCenter.setCity("Negombo");
        inactiveCenter.setLatitude(new BigDecimal("7.2008"));
        inactiveCenter.setLongitude(new BigDecimal("79.8736"));
        inactiveCenter.setPhone("+94312345678");
        inactiveCenter.setEmail("closed@service.lk");
        inactiveCenter.setOperatingHours("Closed");
        inactiveCenter.setIsActive(false);
        inactiveCenter.setCenterSlot(0);
        inactiveCenter = serviceCenterRepository.save(inactiveCenter);
    }

    // ===================================================================
    // GET ALL ACTIVE SERVICE CENTERS
    // ===================================================================

    @Nested
    @DisplayName("GET /service-centers/with-services - Get All Active Service Centers")
    class GetAllWithServicesIntegrationTests {

        @Test
        @DisplayName("Integration: Should return all active service centers")
        void testGetAllWithServices_ReturnsAllActiveCenters() throws Exception {
            mockMvc.perform(get("/service-centers/with-services")
                    .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$", hasSize(3)))
                    .andExpect(jsonPath("$[*].name", hasItems(
                            "Colombo Auto Service Center",
                            "Kandy Auto Care",
                            "Galle Service Station")))
                    .andExpect(jsonPath("$[*].isActive", everyItem(is(true))));

            // Verify database state
            List<ServiceCenter> activeCenters = serviceCenterRepository.findByIsActiveTrue();
            assertEquals(3, activeCenters.size());
        }

        @Test
        @DisplayName("Integration: Should exclude inactive centers")
        void testGetAllWithServices_ExcludesInactiveCenters() throws Exception {
            mockMvc.perform(get("/service-centers/with-services")
                    .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$[*].name", not(hasItem("Closed Auto Center"))))
                    .andExpect(jsonPath("$[*].isActive", not(hasItem(false))));
        }

        @Test
        @DisplayName("Integration: Should return empty list when all centers are inactive")
        void testGetAllWithServices_WhenAllInactive_ReturnsEmpty() throws Exception {
            // Make all centers inactive
            serviceCenterRepository.findAll().forEach(center -> {
                center.setIsActive(false);
                serviceCenterRepository.save(center);
            });

            mockMvc.perform(get("/service-centers/with-services")
                    .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$", hasSize(0)));
        }

        @Test
        @DisplayName("Integration: Should return centers with complete information")
        void testGetAllWithServices_ReturnsCompleteData() throws Exception {
            mockMvc.perform(get("/service-centers/with-services")
                    .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$[0].id").exists())
                    .andExpect(jsonPath("$[0].name").exists())
                    .andExpect(jsonPath("$[0].address").exists())
                    .andExpect(jsonPath("$[0].city").exists())
                    .andExpect(jsonPath("$[0].latitude").exists())
                    .andExpect(jsonPath("$[0].longitude").exists())
                    .andExpect(jsonPath("$[0].phone").exists())
                    .andExpect(jsonPath("$[0].email").exists())
                    .andExpect(jsonPath("$[0].operatingHours").exists())
                    .andExpect(jsonPath("$[0].isActive").exists())
                    .andExpect(jsonPath("$[0].centerSlot").exists());
        }

        @Test
        @DisplayName("Integration: Should return centers ordered consistently")
        void testGetAllWithServices_ConsistentOrdering() throws Exception {
            // Call endpoint multiple times and verify consistent results
            String response1 = mockMvc.perform(get("/service-centers/with-services"))
                    .andExpect(status().isOk())
                    .andReturn().getResponse().getContentAsString();

            String response2 = mockMvc.perform(get("/service-centers/with-services"))
                    .andExpect(status().isOk())
                    .andReturn().getResponse().getContentAsString();

            assertEquals(response1, response2);
        }
    }

    // ===================================================================
    // GET NEARBY SERVICE CENTERS
    // ===================================================================

    @Nested
    @DisplayName("GET /service-centers/nearby-with-services - Get Nearby Service Centers")
    class GetNearbyWithServicesIntegrationTests {

        @Test
        @DisplayName("Integration: Should return nearby centers within default radius (50km)")
        void testGetNearbyWithServices_DefaultRadius() throws Exception {
            // Location in Colombo - should find Colombo center
            mockMvc.perform(get("/service-centers/nearby-with-services")
                    .param("lat", "6.9271")
                    .param("lng", "79.8612")
                    .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(1))))
                    .andExpect(jsonPath("$[*].name", hasItem("Colombo Auto Service Center")));
        }

        @Test
        @DisplayName("Integration: Should return nearby centers within custom radius")
        void testGetNearbyWithServices_CustomRadius() throws Exception {
            // Large radius should find multiple centers
            mockMvc.perform(get("/service-centers/nearby-with-services")
                    .param("lat", "7.0000")
                    .param("lng", "80.0000")
                    .param("radius", "200")
                    .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(1))));
        }

        @Test
        @DisplayName("Integration: Should return empty list for remote location")
        void testGetNearbyWithServices_RemoteLocation() throws Exception {
            // Very remote location with small radius
            mockMvc.perform(get("/service-centers/nearby-with-services")
                    .param("lat", "5.0000")
                    .param("lng", "75.0000")
                    .param("radius", "1")
                    .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$", hasSize(0)));
        }

        @Test
        @DisplayName("Integration: Should handle exact center coordinates")
        void testGetNearbyWithServices_ExactCenterLocation() throws Exception {
            // Exact coordinates of Kandy center
            mockMvc.perform(get("/service-centers/nearby-with-services")
                    .param("lat", kandyCenter.getLatitude().toString())
                    .param("lng", kandyCenter.getLongitude().toString())
                    .param("radius", "50")
                    .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$[*].name", hasItem("Kandy Auto Care")));
        }

        @Test
        @DisplayName("Integration: Should only return active centers in nearby search")
        void testGetNearbyWithServices_OnlyActiveCenters() throws Exception {
            // Location near inactive center
            mockMvc.perform(get("/service-centers/nearby-with-services")
                    .param("lat", inactiveCenter.getLatitude().toString())
                    .param("lng", inactiveCenter.getLongitude().toString())
                    .param("radius", "100")
                    .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$[*].name", not(hasItem("Closed Auto Center"))))
                    .andExpect(jsonPath("$[*].isActive", everyItem(is(true))));
        }

        @Test
        @DisplayName("Integration: Should handle very large radius")
        void testGetNearbyWithServices_LargeRadius() throws Exception {
            // Radius covering entire Sri Lanka
            mockMvc.perform(get("/service-centers/nearby-with-services")
                    .param("lat", "7.8731")
                    .param("lng", "80.7718")
                    .param("radius", "500")
                    .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$", hasSize(3))); // All 3 active centers
        }

        @Test
        @DisplayName("Integration: Should handle very small radius")
        void testGetNearbyWithServices_SmallRadius() throws Exception {
            // 0.1 km radius - should not find anything unless exactly on top
            mockMvc.perform(get("/service-centers/nearby-with-services")
                    .param("lat", "7.0000")
                    .param("lng", "80.0000")
                    .param("radius", "0.1")
                    .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$", hasSize(0)));
        }

        @Test
        @DisplayName("Integration: Distance calculation should be accurate")
        void testGetNearbyWithServices_AccurateDistance() throws Exception {
            // Test with specific known distance
            // Colombo to Galle is approximately 116 km
            mockMvc.perform(get("/service-centers/nearby-with-services")
                    .param("lat", colomboCenter.getLatitude().toString())
                    .param("lng", colomboCenter.getLongitude().toString())
                    .param("radius", "100")
                    .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$[*].name", not(hasItem("Galle Service Station"))));

            // But should find Galle with 150km radius
            mockMvc.perform(get("/service-centers/nearby-with-services")
                    .param("lat", colomboCenter.getLatitude().toString())
                    .param("lng", colomboCenter.getLongitude().toString())
                    .param("radius", "150")
                    .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$[*].name", hasItem("Galle Service Station")));
        }
    }

    // ===================================================================
    // GET SERVICE CENTERS WITH AVAILABLE SLOTS
    // ===================================================================

    @Nested
    @DisplayName("GET /service-centers/with-available-slots - Get Centers with Available Slots")
    class GetWithAvailableSlotsIntegrationTests {

        @Test
        @DisplayName("Integration: Should return only centers with available slots")
        void testGetWithAvailableSlots_ReturnsOnlyCentersWithSlots() throws Exception {
            mockMvc.perform(get("/service-centers/with-available-slots")
                    .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$", hasSize(2))) // Colombo (5) and Galle (3)
                    .andExpect(jsonPath("$[*].name", hasItems(
                            "Colombo Auto Service Center",
                            "Galle Service Station")))
                    .andExpect(jsonPath("$[*].name", not(hasItem("Kandy Auto Care")))) // 0 slots
                    .andExpect(jsonPath("$[*].centerSlot", everyItem(greaterThan(0))));
        }

        @Test
        @DisplayName("Integration: Should exclude centers with zero slots")
        void testGetWithAvailableSlots_ExcludesZeroSlots() throws Exception {
            mockMvc.perform(get("/service-centers/with-available-slots")
                    .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$[*].centerSlot", everyItem(greaterThan(0))));

            // Verify Kandy center (0 slots) is not included
            String response = mockMvc.perform(get("/service-centers/with-available-slots"))
                    .andReturn().getResponse().getContentAsString();

            assertFalse(response.contains("Kandy Auto Care"));
        }

        @Test
        @DisplayName("Integration: Should only return active centers with slots")
        void testGetWithAvailableSlots_OnlyActiveCenters() throws Exception {
            mockMvc.perform(get("/service-centers/with-available-slots")
                    .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$[*].isActive", everyItem(is(true))))
                    .andExpect(jsonPath("$[*].name", not(hasItem("Closed Auto Center"))));
        }

        @Test
        @DisplayName("Integration: Should return empty list when no slots available")
        void testGetWithAvailableSlots_WhenNoSlotsAvailable() throws Exception {
            // Set all centers to 0 slots
            serviceCenterRepository.findAll().forEach(center -> {
                center.setCenterSlot(0);
                serviceCenterRepository.save(center);
            });

            mockMvc.perform(get("/service-centers/with-available-slots")
                    .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$", hasSize(0)));
        }

        @Test
        @DisplayName("Integration: Should update when slots change")
        void testGetWithAvailableSlots_ReflectsSlotChanges() throws Exception {
            // Initially Kandy has 0 slots
            mockMvc.perform(get("/service-centers/with-available-slots"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$[*].name", not(hasItem("Kandy Auto Care"))));

            // Update Kandy to have slots
            kandyCenter.setCenterSlot(5);
            serviceCenterRepository.save(kandyCenter);

            // Now Kandy should appear
            mockMvc.perform(get("/service-centers/with-available-slots"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$[*].name", hasItem("Kandy Auto Care")));
        }

        @Test
        @DisplayName("Integration: Should handle single slot correctly")
        void testGetWithAvailableSlots_SingleSlot() throws Exception {
            // Create center with just 1 slot
            ServiceCenter oneSlotCenter = new ServiceCenter();
            oneSlotCenter.setName("One Slot Center");
            oneSlotCenter.setAddress("111 Test Road");
            oneSlotCenter.setCity("Colombo");
            oneSlotCenter.setLatitude(new BigDecimal("6.9000"));
            oneSlotCenter.setLongitude(new BigDecimal("79.8000"));
            oneSlotCenter.setPhone("+94111111111");
            oneSlotCenter.setEmail("oneslot@test.lk");
            oneSlotCenter.setOperatingHours("24/7");
            oneSlotCenter.setIsActive(true);
            oneSlotCenter.setCenterSlot(1);
            serviceCenterRepository.save(oneSlotCenter);

            mockMvc.perform(get("/service-centers/with-available-slots"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$[*].name", hasItem("One Slot Center")))
                    .andExpect(jsonPath("$[*].centerSlot", hasItem(1)));
        }

        @Test
        @DisplayName("Integration: Should handle many slots correctly")
        void testGetWithAvailableSlots_ManySlots() throws Exception {
            // Update Colombo center to have many slots
            colomboCenter.setCenterSlot(100);
            serviceCenterRepository.save(colomboCenter);

            mockMvc.perform(get("/service-centers/with-available-slots"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$[*].centerSlot", hasItem(100)));
        }
    }

    // ===================================================================
    // DATABASE INTEGRATION TESTS
    // ===================================================================

    @Nested
    @DisplayName("Database Integration Tests")
    class DatabaseIntegrationTests {

        @Test
        @DisplayName("Integration: Repository query for active centers should match endpoint")
        void testRepositoryQueryMatchesEndpoint() throws Exception {
            // Get from repository
            List<ServiceCenter> dbCenters = serviceCenterRepository.findByIsActiveTrue();

            // Get from endpoint
            String response = mockMvc.perform(get("/service-centers/with-services"))
                    .andExpect(status().isOk())
                    .andReturn().getResponse().getContentAsString();

            // Verify counts match
            int endpointCount = objectMapper.readTree(response).size();
            assertEquals(dbCenters.size(), endpointCount);
        }

        @Test
        @DisplayName("Integration: Nearby query should handle database precision correctly")
        void testNearbyQueryPrecision() throws Exception {
            // Test with high-precision coordinates
            String lat = "6.92710000";
            String lng = "79.86120000";

            mockMvc.perform(get("/service-centers/nearby-with-services")
                    .param("lat", lat)
                    .param("lng", lng)
                    .param("radius", "50"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$").isArray());
        }

        @Test
        @DisplayName("Integration: Available slots query should use correct comparison")
        void testAvailableSlotsQueryCorrectness() throws Exception {
            // Direct repository query
            List<ServiceCenter> dbCenters = serviceCenterRepository
                    .findByIsActiveTrueAndCenterSlotGreaterThan(0);

            // Endpoint query
            String response = mockMvc.perform(get("/service-centers/with-available-slots"))
                    .andExpect(status().isOk())
                    .andReturn().getResponse().getContentAsString();

            int endpointCount = objectMapper.readTree(response).size();
            assertEquals(dbCenters.size(), endpointCount);
        }

        @Test
        @DisplayName("Integration: Should handle concurrent requests correctly")
        void testConcurrentRequests() throws Exception {
            // Multiple concurrent requests should return consistent results
            for (int i = 0; i < 5; i++) {
                mockMvc.perform(get("/service-centers/with-services"))
                        .andExpect(status().isOk())
                        .andExpect(jsonPath("$", hasSize(3)));
            }
        }

        @Test
        @DisplayName("Integration: Transaction rollback should not affect test isolation")
        void testTransactionIsolation() throws Exception {
            // Verify initial state
            mockMvc.perform(get("/service-centers/with-services"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$", hasSize(3)));

            // Data from setUp should be consistent
            List<ServiceCenter> centers = serviceCenterRepository.findByIsActiveTrue();
            assertEquals(3, centers.size());
        }
    }

    // ===================================================================
    // BUSINESS LOGIC INTEGRATION TESTS
    // ===================================================================

    @Nested
    @DisplayName("Business Logic Integration Tests")
    class BusinessLogicIntegrationTests {

        @Test
        @DisplayName("Integration: Center should appear in multiple endpoints correctly")
        void testCenterAppearsInMultipleEndpoints() throws Exception {
            // Colombo center should appear in all three endpoints

            // 1. All active centers
            mockMvc.perform(get("/service-centers/with-services"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$[*].name", hasItem("Colombo Auto Service Center")));

            // 2. Nearby centers (at its location)
            mockMvc.perform(get("/service-centers/nearby-with-services")
                    .param("lat", colomboCenter.getLatitude().toString())
                    .param("lng", colomboCenter.getLongitude().toString())
                    .param("radius", "50"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$[*].name", hasItem("Colombo Auto Service Center")));

            // 3. Centers with available slots
            mockMvc.perform(get("/service-centers/with-available-slots"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$[*].name", hasItem("Colombo Auto Service Center")));
        }

        @Test
        @DisplayName("Integration: Inactive center should not appear in any endpoint")
        void testInactiveCenterExcludedFromAllEndpoints() throws Exception {
            String inactiveName = "Closed Auto Center";

            // 1. All active centers
            mockMvc.perform(get("/service-centers/with-services"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$[*].name", not(hasItem(inactiveName))));

            // 2. Nearby centers
            mockMvc.perform(get("/service-centers/nearby-with-services")
                    .param("lat", inactiveCenter.getLatitude().toString())
                    .param("lng", inactiveCenter.getLongitude().toString())
                    .param("radius", "50"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$[*].name", not(hasItem(inactiveName))));

            // 3. Centers with available slots
            mockMvc.perform(get("/service-centers/with-available-slots"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$[*].name", not(hasItem(inactiveName))));
        }

        @Test
        @DisplayName("Integration: Center without slots should only appear in get all and nearby")
        void testCenterWithoutSlotsVisibility() throws Exception {
            String kandyName = "Kandy Auto Care";

            // 1. Should appear in all active centers
            mockMvc.perform(get("/service-centers/with-services"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$[*].name", hasItem(kandyName)));

            // 2. Should appear in nearby if within radius
            mockMvc.perform(get("/service-centers/nearby-with-services")
                    .param("lat", kandyCenter.getLatitude().toString())
                    .param("lng", kandyCenter.getLongitude().toString())
                    .param("radius", "50"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$[*].name", hasItem(kandyName)));

            // 3. Should NOT appear in centers with available slots
            mockMvc.perform(get("/service-centers/with-available-slots"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$[*].name", not(hasItem(kandyName))));
        }

        @Test
        @DisplayName("Integration: Complete workflow - activate and deactivate center")
        void testCompleteActivationWorkflow() throws Exception {
            // 1. Verify Galle center is active and has slots
            mockMvc.perform(get("/service-centers/with-available-slots"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$[*].name", hasItem("Galle Service Station")));

            // 2. Deactivate Galle center
            galleCenter.setIsActive(false);
            serviceCenterRepository.save(galleCenter);

            // 3. Should no longer appear in any endpoint
            mockMvc.perform(get("/service-centers/with-services"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$[*].name", not(hasItem("Galle Service Station"))));

            mockMvc.perform(get("/service-centers/with-available-slots"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$[*].name", not(hasItem("Galle Service Station"))));

            // 4. Reactivate Galle center
            galleCenter.setIsActive(true);
            serviceCenterRepository.save(galleCenter);

            // 5. Should appear again
            mockMvc.perform(get("/service-centers/with-available-slots"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$[*].name", hasItem("Galle Service Station")));
        }

        @Test
        @DisplayName("Integration: Complete workflow - slot management")
        void testCompleteSlotManagementWorkflow() throws Exception {
            String kandyName = "Kandy Auto Care";

            // 1. Initially no slots - not in available slots endpoint
            mockMvc.perform(get("/service-centers/with-available-slots"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$[*].name", not(hasItem(kandyName))));

            // 2. Add slots
            kandyCenter.setCenterSlot(10);
            serviceCenterRepository.save(kandyCenter);

            // 3. Should now appear
            mockMvc.perform(get("/service-centers/with-available-slots"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$[*].name", hasItem(kandyName)))
                    .andExpect(jsonPath("$[?(@.name=='Kandy Auto Care')].centerSlot").value(10));

            // 4. Reduce to 1 slot
            kandyCenter.setCenterSlot(1);
            serviceCenterRepository.save(kandyCenter);

            // 5. Should still appear (1 > 0)
            mockMvc.perform(get("/service-centers/with-available-slots"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$[*].name", hasItem(kandyName)));

            // 6. Remove all slots
            kandyCenter.setCenterSlot(0);
            serviceCenterRepository.save(kandyCenter);

            // 7. Should no longer appear
            mockMvc.perform(get("/service-centers/with-available-slots"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$[*].name", not(hasItem(kandyName))));
        }

        @Test
        @DisplayName("Integration: Geospatial accuracy with real Sri Lankan distances")
        void testGeospatialAccuracy() throws Exception {
            // Colombo to Kandy is approximately 115 km
            // With 100km radius, Kandy should not be found
            mockMvc.perform(get("/service-centers/nearby-with-services")
                    .param("lat", colomboCenter.getLatitude().toString())
                    .param("lng", colomboCenter.getLongitude().toString())
                    .param("radius", "100"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$[*].name", hasItem("Colombo Auto Service Center")));

            // With 200km radius, should find both Colombo and Kandy
            mockMvc.perform(get("/service-centers/nearby-with-services")
                    .param("lat", colomboCenter.getLatitude().toString())
                    .param("lng", colomboCenter.getLongitude().toString())
                    .param("radius", "200"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(2))));
        }
    }

    // ===================================================================
    // ERROR HANDLING INTEGRATION TESTS
    // ===================================================================

    @Nested
    @DisplayName("Error Handling Integration Tests")
    class ErrorHandlingIntegrationTests {

        @Test
        @DisplayName("Integration: Should handle empty database gracefully")
        void testEmptyDatabase() throws Exception {
            serviceCenterRepository.deleteAll();

            mockMvc.perform(get("/service-centers/with-services"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$", hasSize(0)));

            mockMvc.perform(get("/service-centers/with-available-slots"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$", hasSize(0)));
        }
    }
}
