package com.example.E_WardApplication.security;

import com.example.E_WardApplication.entity.AppUser;
import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.Instant;
import java.util.Collection;
import java.util.List;

@Getter
public class UserPrincipal implements UserDetails {

    private final Long id;
    private final String username;
    private final String password;
    private final String fullName;
    private final String email;
    private final Instant createdAt;
    private final List<GrantedAuthority> authorities;

    public UserPrincipal(AppUser user) {
        this.id = user.getId();
        this.username = user.getUsername();
        this.password = user.getPassword();
        this.fullName = user.getFullName();
        this.email = user.getEmail();
        this.createdAt = user.getCreatedAt();
        String roleName = user.getRole() != null ? user.getRole().name() : "STAFF";
        this.authorities = List.of(new SimpleGrantedAuthority("ROLE_" + roleName));
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    // account is always enabled in this simple implementation — production can add flags
    @Override
    public boolean isAccountNonExpired() {
        return true;
    }
    @Override
    public boolean isAccountNonLocked() {
        return true;
    }
    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }
    @Override
    public boolean isEnabled() {
        return true;
    }

    @Override
    public String getPassword() { return password; }

    @Override
    public String getUsername() { return username; }
}



