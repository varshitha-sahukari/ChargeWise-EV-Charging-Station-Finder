package com.chargewise.service;

import com.chargewise.dto.StationDto;
import com.chargewise.entity.ConnectorType;
import com.chargewise.entity.Station;
import com.chargewise.entity.StationConnector;
import com.chargewise.exception.ResourceNotFoundException;
import com.chargewise.repository.StationRepository;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.Predicate;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Slf4j
public class StationService {

    private final StationRepository stationRepository;
    private final ModelMapper modelMapper;

    public StationService(StationRepository stationRepository, ModelMapper modelMapper) {
        this.stationRepository = stationRepository;
        this.modelMapper = modelMapper;
    }

    public List<StationDto> getAllStations() {
        return stationRepository.findAll().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public StationDto getStationById(Long id) {
        Station station = stationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Station not found with id: " + id));
        return convertToDto(station);
    }

    public List<StationDto> findNearbyStations(double lat, double lng, double radiusKm) {
        return stationRepository.findNearby(lat, lng, radiusKm).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public List<StationDto> searchAndFilterStations(
            String search, String connectorType, Boolean fastCharging,
            String status, String network, Double minPower, Double maxPower) {
        
        Specification<Station> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Search by Name, Address, State, PIN code
            if (StringUtils.hasText(search)) {
                String lowerSearch = "%" + search.toLowerCase() + "%";
                Predicate nameLike = cb.like(cb.lower(root.get("name")), lowerSearch);
                Predicate addressLike = cb.like(cb.lower(root.get("address")), lowerSearch);
                Predicate stateLike = cb.like(cb.lower(root.get("state")), lowerSearch);
                Predicate pinLike = cb.like(cb.lower(root.get("pinCode")), lowerSearch);
                predicates.add(cb.or(nameLike, addressLike, stateLike, pinLike));
            }

            // Filter by liveStatus
            if (StringUtils.hasText(status)) {
                predicates.add(cb.equal(root.get("status"), status));
            }

            // Filter by Charging Network
            if (StringUtils.hasText(network)) {
                predicates.add(cb.equal(root.get("network"), network));
            }

            // Filter by Connectors (Type, Power, speed)
            if (StringUtils.hasText(connectorType) || minPower != null || maxPower != null || fastCharging != null) {
                Join<Station, StationConnector> connectorJoin = root.join("connectors");

                if (StringUtils.hasText(connectorType)) {
                    Join<StationConnector, ConnectorType> typeJoin = connectorJoin.join("connectorType");
                    predicates.add(cb.equal(cb.lower(typeJoin.get("name")), connectorType.toLowerCase()));
                }

                if (minPower != null) {
                    predicates.add(cb.ge(connectorJoin.get("powerOutputKw"), minPower));
                }

                if (maxPower != null) {
                    predicates.add(cb.le(connectorJoin.get("powerOutputKw"), maxPower));
                }

                if (fastCharging != null) {
                    if (fastCharging) {
                        predicates.add(cb.ge(connectorJoin.get("powerOutputKw"), 22.0)); // Fast charging >= 22kW
                    } else {
                        predicates.add(cb.lt(connectorJoin.get("powerOutputKw"), 22.0)); // Slow charging < 22kW
                    }
                }
            }

            // Avoid duplicate records because of join
            query.distinct(true);

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        return stationRepository.findAll(spec).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public StationDto saveStation(StationDto stationDto) {
        Station station = modelMapper.map(stationDto, Station.class);
        Station saved = stationRepository.save(station);
        log.info("Station saved: {}", saved.getName());
        return convertToDto(saved);
    }

    @Transactional
    public void deleteStation(Long id) {
        if (!stationRepository.existsById(id)) {
            throw new ResourceNotFoundException("Station not found with id: " + id);
        }
        stationRepository.deleteById(id);
        log.info("Station deleted: {}", id);
    }

    @Transactional
    public StationDto updateStationStatus(Long id, String status) {
        Station station = stationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Station not found with id: " + id));
        station.setStatus(status);
        // Also update connectors' status
        station.getConnectors().forEach(c -> c.setStatus(status));
        Station saved = stationRepository.save(station);
        log.info("Station status updated to {}: {}", status, saved.getName());
        return convertToDto(saved);
    }

    private StationDto convertToDto(Station station) {
        return modelMapper.map(station, StationDto.class);
    }
}
