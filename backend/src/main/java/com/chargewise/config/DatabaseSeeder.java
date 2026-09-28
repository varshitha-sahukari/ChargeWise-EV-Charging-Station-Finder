package com.chargewise.config;

import com.chargewise.entity.*;
import com.chargewise.repository.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.*;

@Component
@Slf4j
public class DatabaseSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final VehicleRepository vehicleRepository;
    private final ConnectorTypeRepository connectorTypeRepository;
    private final StationRepository stationRepository;
    private final ReviewRepository reviewRepository;
    private final ChargingHistoryRepository historyRepository;
    private final PasswordEncoder passwordEncoder;

    public DatabaseSeeder(UserRepository userRepository, VehicleRepository vehicleRepository,
                          ConnectorTypeRepository connectorTypeRepository, StationRepository stationRepository,
                          ReviewRepository reviewRepository, ChargingHistoryRepository historyRepository,
                          PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.vehicleRepository = vehicleRepository;
        this.connectorTypeRepository = connectorTypeRepository;
        this.stationRepository = stationRepository;
        this.reviewRepository = reviewRepository;
        this.historyRepository = historyRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        if (userRepository.count() > 0) {
            log.info("Database already seeded. Skipping initialization.");
            return;
        }

        log.info("Starting database seeding...");

        // 1. Create Default Users
        User admin = User.builder()
                .username("admin")
                .email("admin@chargewise.in")
                .password(passwordEncoder.encode("admin123"))
                .role("ROLE_ADMIN")
                .emailVerified(true)
                .profilePicture("https://api.dicebear.com/7.x/bottts/svg?seed=admin")
                .build();
        userRepository.save(admin);

        User user = User.builder()
                .username("Rajesh Kumar")
                .email("rajesh@gmail.com")
                .password(passwordEncoder.encode("user123"))
                .role("ROLE_USER")
                .emailVerified(true)
                .profilePicture("https://api.dicebear.com/7.x/avataaars/svg?seed=Rajesh")
                .build();
        userRepository.save(user);

        // 2. Create Connector Types
        List<ConnectorType> connectors = new ArrayList<>();
        connectors.add(connectorTypeRepository.save(new ConnectorType(null, "CCS2", "Combined Charging System 2 (DC Fast Charging)", 150.0)));
        connectors.add(connectorTypeRepository.save(new ConnectorType(null, "Type 2", "Mennekes AC Connector (Slow/Fast AC)", 22.0)));
        connectors.add(connectorTypeRepository.save(new ConnectorType(null, "CHAdeMO", "Japanese DC Fast Charging plug", 50.0)));
        connectors.add(connectorTypeRepository.save(new ConnectorType(null, "AC001", "Standard Indian AC Charger", 10.0)));
        connectors.add(connectorTypeRepository.save(new ConnectorType(null, "DC001", "GB/T Standard Indian DC Fast Charger", 15.0)));

        // 3. Create Default Vehicles for Rajesh
        Vehicle nexon = Vehicle.builder()
                .brand("Tata")
                .model("Nexon EV Max")
                .batteryCapacity(40.5)
                .maxRange(437.0)
                .connectorType("CCS2")
                .user(user)
                .build();
        vehicleRepository.save(nexon);

        Vehicle tiago = Vehicle.builder()
                .brand("Tata")
                .model("Tiago EV")
                .batteryCapacity(24.0)
                .maxRange(250.0)
                .connectorType("CCS2")
                .user(user)
                .build();
        vehicleRepository.save(tiago);

        Vehicle ather = Vehicle.builder()
                .brand("Ather")
                .model("450X Gen 4")
                .batteryCapacity(3.7)
                .maxRange(150.0)
                .connectorType("Type 2")
                .user(user)
                .build();
        vehicleRepository.save(ather);

        // 4. Seed Stations across Indian States
        seedIndianStations(connectors);

        log.info("Database seeding complete. Seeded users, vehicles, connector types, and stations.");
    }

    private void seedIndianStations(List<ConnectorType> connectorTypes) {
        // List of major states/UTs in India and their central hub coordinates
        Map<String, double[]> hubs = new LinkedHashMap<>();
        hubs.put("Delhi", new double[]{28.6139, 77.2090});
        hubs.put("Maharashtra (Mumbai)", new double[]{19.0760, 72.8777});
        hubs.put("Karnataka (Bengaluru)", new double[]{12.9716, 77.5946});
        hubs.put("Tamil Nadu (Chennai)", new double[]{13.0827, 80.2707});
        hubs.put("Telangana (Hyderabad)", new double[]{17.3850, 78.4867});
        hubs.put("West Bengal (Kolkata)", new double[]{22.5726, 88.3639});
        hubs.put("Maharashtra (Pune)", new double[]{18.5204, 73.8567});
        hubs.put("Rajasthan (Jaipur)", new double[]{26.9124, 75.7873});
        hubs.put("Gujarat (Ahmedabad)", new double[]{23.0225, 72.5714});
        hubs.put("Uttar Pradesh (Lucknow)", new double[]{26.8467, 80.9462});
        hubs.put("Madhya Pradesh (Bhopal)", new double[]{23.2599, 77.4126});
        hubs.put("Kerala (Kochi)", new double[]{9.9312, 76.2673});
        hubs.put("Punjab (Chandigarh)", new double[]{30.7333, 76.7794});
        hubs.put("Odisha (Bhubaneswar)", new double[]{20.2961, 85.8245});
        hubs.put("Assam (Guwahati)", new double[]{26.1445, 91.7362});
        hubs.put("Goa (Panaji)", new double[]{15.4909, 73.8278});
        hubs.put("Uttarakhand (Dehradun)", new double[]{30.3165, 78.0322});
        hubs.put("Bihar (Patna)", new double[]{25.5941, 85.1376});
        hubs.put("Jharkhand (Ranchi)", new double[]{23.3441, 85.3096});
        hubs.put("Chhattisgarh (Raipur)", new double[]{21.2514, 81.6296});
        hubs.put("Jammu & Kashmir (Srinagar)", new double[]{34.0837, 74.7973});
        hubs.put("Himachal Pradesh (Shimla)", new double[]{31.1048, 77.1734});
        hubs.put("Andhra Pradesh (Vijayawada)", new double[]{16.5062, 80.6480});
        hubs.put("Haryana (Gurugram)", new double[]{28.4595, 77.0266});

        String[] networks = {"Tata Power EZ Charge", "Statiq", "ChargeZone", "Jio-bp Pulse", "Ather Grid", "Zeon Charging", "Shell Recharge"};
        String[] statusOptions = {"AVAILABLE", "AVAILABLE", "AVAILABLE", "BUSY", "OFFLINE"};
        String[] locations = {"Mall Parking Lot", "Highway Food Plaza", "Metro Station", "Tech Park Gate 2", "Petrol Pump", "Residential Hub"};

        Random rand = new Random(42); // fixed seed for consistency

        List<Station> seededStations = new ArrayList<>();
        int stationIdCounter = 1;

        for (Map.Entry<String, double[]> hubEntry : hubs.entrySet()) {
            String stateName = hubEntry.getKey().split(" \\(")[0];
            String cityName = hubEntry.getKey().contains("(") ? 
                    hubEntry.getKey().substring(hubEntry.getKey().indexOf("(")+1, hubEntry.getKey().indexOf(")")) : hubEntry.getKey();
            double baseLat = hubEntry.getValue()[0];
            double baseLng = hubEntry.getValue()[1];

            // Seed 22-25 stations per state hub
            int countForState = 22 + rand.nextInt(4);
            for (int i = 0; i < countForState; i++) {
                // Random position within 15 km of the hub
                double offsetLat = (rand.nextDouble() - 0.5) * 0.25;
                double offsetLng = (rand.nextDouble() - 0.5) * 0.25;
                double lat = baseLat + offsetLat;
                double lng = baseLng + offsetLng;

                String network = networks[rand.nextInt(networks.length)];
                String status = statusOptions[rand.nextInt(statusOptions.length)];
                String locType = locations[rand.nextInt(locations.length)];
                String name = network + " " + cityName + " - " + locType + " #" + (i + 1);
                
                String address = (i + 101) + ", Near Highway Point, " + cityName + ", " + stateName + ", India";
                String pinCode = String.valueOf(110000 + rand.nextInt(880000));
                double pricing = 12.0 + rand.nextInt(9); // 12 to 20 INR per kWh
                double avgRating = 3.5 + (rand.nextDouble() * 1.5); // 3.5 to 5.0
                int reviewsCount = 5 + rand.nextInt(45);
                double carbonSaved = 50.0 + rand.nextInt(950);

                Station station = Station.builder()
                        .name(name)
                        .address(address)
                        .latitude(lat)
                        .longitude(lng)
                        .network(network)
                        .state(stateName)
                        .pinCode(pinCode)
                        .operatingHours("24 Hours")
                        .contactDetails("+91 98765 4" + String.format("%04d", stationIdCounter))
                        .basePricing(pricing)
                        .status(status)
                        .averageRating(Math.round(avgRating * 10.0) / 10.0)
                        .reviewsCount(reviewsCount)
                        .carbonSavedKg(carbonSaved)
                        .build();

                // Add 1 to 3 station connectors
                int connectorCount = 1 + rand.nextInt(3);
                for (int c = 0; c < connectorCount; c++) {
                    ConnectorType type = connectorTypes.get(rand.nextInt(connectorTypes.size()));
                    
                    // Match network connector preferences (e.g. Ather Grid usually uses Type 2)
                    if ("Ather Grid".equalsIgnoreCase(network)) {
                        type = connectorTypes.stream().filter(t -> "Type 2".equals(t.getName())).findFirst().orElse(type);
                    }

                    double power = type.getMaxPowerKw();
                    if ("CCS2".equals(type.getName())) {
                        double[] ccsPowers = {30.0, 50.0, 60.0, 120.0, 150.0};
                        power = ccsPowers[rand.nextInt(ccsPowers.length)];
                    }

                    StationConnector connector = StationConnector.builder()
                            .connectorType(type)
                            .status(status)
                            .powerOutputKw(power)
                            .pricing(pricing)
                            .build();
                    station.addConnector(connector);
                }

                // Add a mock image
                String mockImage = "https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=600&q=80";
                if (rand.nextBoolean()) {
                    mockImage = "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=600&q=80";
                }
                station.addImage(StationImage.builder().imageUrl(mockImage).build());

                seededStations.add(stationRepository.save(station));
                stationIdCounter++;
            }
        }

        // Seed 15 Reviews & 15 Charging Histories for Rajesh to view
        User rajesh = userRepository.findByEmail("rajesh@gmail.com").orElse(null);
        if (rajesh != null && !seededStations.isEmpty()) {
            for (int r = 0; r < 15; r++) {
                Station s = seededStations.get(rand.nextInt(seededStations.size()));
                
                // Add reviews
                Review review = Review.builder()
                        .user(rajesh)
                        .station(s)
                        .rating(4 + rand.nextInt(2))
                        .comment("Great charging speed! Clean food court nearby while waiting.")
                        .build();
                reviewRepository.save(review);

                // Add history
                double kwh = 15.0 + rand.nextDouble() * 25.0;
                ChargingHistory history = ChargingHistory.builder()
                        .user(rajesh)
                        .station(s)
                        .energyConsumedKwh(Math.round(kwh * 10.0) / 10.0)
                        .totalCost(Math.round(kwh * s.getBasePricing() * 10.0) / 10.0)
                        .chargingDurationMinutes(20 + rand.nextInt(35))
                        .sessionDate(LocalDateTime.now().minusDays(r + 1))
                        .build();
                historyRepository.save(history);
            }
        }
    }
}
