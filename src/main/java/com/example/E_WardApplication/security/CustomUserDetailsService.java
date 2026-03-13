package com.example.E_WardApplication.security;

import com.example.E_WardApplication.entity.AppUser;
import com.example.E_WardApplication.repository.AppUserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final AppUserRepository userRepository;

    @Override
    @Transactional
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        AppUser user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with username: " + username));
        return new UserPrincipal(user); // upcast to UserDetails
    }

    @Transactional
    public UserPrincipal loadUserById(Long id) throws UsernameNotFoundException {
        AppUser user = userRepository.findById(id)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with id: " + id));
        return new UserPrincipal(user);
    }
}

//@Service
////@RequiredArgsConstructor
//public class CustomUserDetailsService {
//
//    private final AppUserRepository userRepository;
//
//    public CustomUserDetailsService(AppUserRepository userRepository) {
//        this.userRepository = userRepository;
//    }
// remove this
//    @Transactional
//    public UserPrincipal loadUserByUsername(String username) throws UsernameNotFoundException {
//        AppUser user = userRepository.findByUsername(username)
//                .orElseThrow(() -> new UsernameNotFoundException("User not found with username: " + username));
//        return new UserPrincipal(user);
//    }
// remove this
//    @Override
//    @Transactional
//    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
//        AppUser user = userRepository.findByUsername(username)
//                .orElseThrow(() -> new UsernameNotFoundException("User not found with username: " + username));
//        return new UserPrincipal(user);
//    }
//
//
//    @Transactional
//    public UserDetails loadUserById(Long id) throws UsernameNotFoundException {
//        AppUser user = userRepository.findById(id)
//                .orElseThrow(() -> new UsernameNotFoundException("User not found with id: " + id));
//        return new UserPrincipal(user);
//    }
//

//    @Transactional
//    public UserPrincipal loadUserById(Long id) throws UsernameNotFoundException {
//        AppUser user = userRepository.findById(id)
//                .orElseThrow(() -> new UsernameNotFoundException("User not found with id: " + id));
//        return new UserPrincipal(user);
//    }




//}
