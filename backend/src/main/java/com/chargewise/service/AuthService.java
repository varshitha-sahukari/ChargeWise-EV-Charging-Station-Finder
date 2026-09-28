package com.chargewise.service;

import com.chargewise.dto.*;
import com.chargewise.entity.User;
import com.chargewise.exception.BadRequestException;
import com.chargewise.exception.ResourceNotFoundException;
import com.chargewise.repository.UserRepository;
import com.chargewise.security.JwtTokenProvider;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.UUID;

@Service
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtTokenProvider tokenProvider) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenProvider = tokenProvider;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email is already in use");
        }

        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role("ROLE_USER")
                .emailVerified(false)
                .verificationToken(UUID.randomUUID().toString())
                .profilePicture("https://api.dicebear.com/7.x/bottts/svg?seed=" + request.getUsername())
                .build();

        userRepository.save(user);
        log.info("User registered successfully: {}", user.getEmail());

        // In a real application, you would send a verification email here.
        log.info("Verification token generated for {}: {}", user.getEmail(), user.getVerificationToken());

        return login(new AuthRequest() {{
            setEmail(request.getEmail());
            setPassword(request.getPassword());
        }});
    }

    @Transactional
    public AuthResponse login(AuthRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + request.getEmail()));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new BadRequestException("Invalid email or password");
        }

        String accessToken = tokenProvider.generateAccessToken(user.getEmail(), user.getRole(), user.getId());
        String refreshToken = tokenProvider.generateRefreshToken(user.getEmail());

        user.setRefreshToken(refreshToken);
        userRepository.save(user);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .email(user.getEmail())
                .username(user.getUsername())
                .role(user.getRole())
                .userId(user.getId())
                .build();
    }

    @Transactional
    public AuthResponse googleLogin(String googleToken) {
        // In a real production application, you would call Google's Token Verifier API:
        // NetHttpTransport transport = new NetHttpTransport();
        // JsonFactory jsonFactory = GsonFactory.getDefaultInstance();
        // GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(transport, jsonFactory)
        //     .setAudience(Collections.singletonList(CLIENT_ID))
        //     .build();
        // GoogleIdToken idToken = verifier.verify(googleToken);
        // Payload payload = idToken.getPayload();
        // String email = payload.getEmail();
        
        // For local development and ease of demonstration, we mock Google Auth payload extraction:
        String mockEmail;
        String mockName;
        if (googleToken.contains("@")) {
            mockEmail = googleToken;
            mockName = googleToken.split("@")[0];
        } else {
            mockEmail = "google.user@chargewise.in";
            mockName = "Google User";
        }

        User user = userRepository.findByEmail(mockEmail)
                .orElseGet(() -> {
                    User newUser = User.builder()
                            .email(mockEmail)
                            .username(mockName)
                            .password(passwordEncoder.encode(UUID.randomUUID().toString())) // dummy password
                            .role("ROLE_USER")
                            .emailVerified(true)
                            .profilePicture("https://api.dicebear.com/7.x/avataaars/svg?seed=" + mockName)
                            .build();
                    return userRepository.save(newUser);
                });

        String accessToken = tokenProvider.generateAccessToken(user.getEmail(), user.getRole(), user.getId());
        String refreshToken = tokenProvider.generateRefreshToken(user.getEmail());

        user.setRefreshToken(refreshToken);
        userRepository.save(user);

        log.info("Google login successful for: {}", user.getEmail());

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .email(user.getEmail())
                .username(user.getUsername())
                .role(user.getRole())
                .userId(user.getId())
                .build();
    }

    @Transactional
    public void verifyEmail(String token) {
        User user = userRepository.findByVerificationToken(token)
                .orElseThrow(() -> new BadRequestException("Invalid or expired verification token"));

        user.setEmailVerified(true);
        user.setVerificationToken(null);
        userRepository.save(user);
        log.info("Email verified for user: {}", user.getEmail());
    }

    @Transactional
    public String forgotPassword(ForgotPasswordRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + request.getEmail()));

        String resetToken = UUID.randomUUID().toString();
        user.setResetToken(resetToken);
        userRepository.save(user);

        log.info("Reset password token for {}: {}", user.getEmail(), resetToken);
        return resetToken;
    }

    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        User user = userRepository.findByResetToken(request.getToken())
                .orElseThrow(() -> new BadRequestException("Invalid or expired reset token"));

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setResetToken(null);
        userRepository.save(user);
        log.info("Password reset successful for user: {}", user.getEmail());
    }

    @Transactional
    public AuthResponse refreshToken(String refreshToken) {
        if (!tokenProvider.validateToken(refreshToken)) {
            throw new BadRequestException("Invalid refresh token");
        }

        String email = tokenProvider.getEmailFromToken(refreshToken);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));

        if (user.getRefreshToken() == null || !user.getRefreshToken().equals(refreshToken)) {
            throw new BadRequestException("Refresh token is revoked or modified");
        }

        String newAccessToken = tokenProvider.generateAccessToken(user.getEmail(), user.getRole(), user.getId());
        String newRefreshToken = tokenProvider.generateRefreshToken(user.getEmail());

        user.setRefreshToken(newRefreshToken);
        userRepository.save(user);

        return AuthResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(newRefreshToken)
                .email(user.getEmail())
                .username(user.getUsername())
                .role(user.getRole())
                .userId(user.getId())
                .build();
    }
}
