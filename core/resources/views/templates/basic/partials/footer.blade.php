<?php
// Get the current year for the copyright
$currentYear = date('Y');
?>

<!-- Footer Section -->
<footer class="footer" style="background-color: #111723; color: #fff; padding: 60px 0 0; margin-top: 30px;">
    <div class="container">
        <div class="row">
            <div class="col-12">
                <div class="footer__content section">
                    <div class="row g-4 justify-content-xl-between">
                        <!-- About Section -->
                        <div class="col-md-6 col-lg-3">
                            <div class="footer__contact">
                                <h4 class="footer__title text--white mt-0" style="color: #fff; font-size: 1.25rem; margin-bottom: 1rem;">Made for 90s Hearts, Built with Real Love.</h4>
                                <p class="text--white" style="color: #bbb; margin-bottom: 1rem;">
                                    90sKalyanam is a Tamil matrimony platform dedicated to helping you find your perfect life partner.
                                </p>
                            </div>
                        </div>

                        <!-- Quick Links Section -->
                        <div class="col-md-6 col-lg-3 col-xl-2">
                            <h4 class="footer__title text--white mt-0" style="color: #fff; font-size: 1.25rem; margin-bottom: 1rem;">Quick Links</h4>
                            <ul class="list-unstyled" style="padding-left: 0; list-style: none;">
                                <li style="margin-bottom: 0.8rem;">
                                    <a href="{{ url('/') }}" style="color: #bbb; text-decoration: none; transition: color 0.3s; display: flex; align-items: center;" onmouseover="this.style.color='#fff'" onmouseout="this.style.color='#bbb'">
                                        <i class="fas fa-chevron-right" style="margin-right: 8px; font-size: 0.7rem; color: #ff6b6b;"></i> Home
                                    </a>
                                </li>
                                <li style="margin-bottom: 0.8rem;">
                                    <a href="{{ route('stories') }}" style="color: #bbb; text-decoration: none; transition: color 0.3s; display: flex; align-items: center;" onmouseover="this.style.color='#fff'" onmouseout="this.style.color='#bbb'">
                                        <i class="fas fa-chevron-right" style="margin-right: 8px; font-size: 0.7rem; color: #ff6b6b;"></i> Success Stories
                                    </a>
                                </li>
                                <li>
                                    <a href="{{ route('contact') }}" style="color: #bbb; text-decoration: none; transition: color 0.3s; display: flex; align-items: center;" onmouseover="this.style.color='#fff'" onmouseout="this.style.color='#bbb'">
                                        <i class="fas fa-chevron-right" style="margin-right: 8px; font-size: 0.7rem; color: #ff6b6b;"></i> Contact Us
                                    </a>
                                </li>
                            </ul>
                        </div>

                        <!-- Policies Section -->
                        <div class="col-md-6 col-lg-3 col-xl-2">
                            <h4 class="footer__title text--white mt-0" style="color: #fff; font-size: 1.25rem; margin-bottom: 1rem;">Policies</h4>
                            <ul class="list-unstyled" style="padding-left: 0; list-style: none;">
                                <li style="margin-bottom: 0.8rem;">
                                    <a href="{{ route('policy.pages', ['privacy-policy', 42]) }}" style="color: #bbb; text-decoration: none; transition: color 0.3s; display: flex; align-items: center;" onmouseover="this.style.color='#fff'" onmouseout="this.style.color='#bbb'">
                                        <i class="fas fa-chevron-right" style="margin-right: 8px; font-size: 0.7rem; color: #ff6b6b;"></i> Privacy Policy
                                    </a>
                                </li>
                                <li style="margin-bottom: 0.8rem;">
                                    <a href="{{ route('policy.pages', ['terms-of-service', 43]) }}" style="color: #bbb; text-decoration: none; transition: color 0.3s; display: flex; align-items: center;" onmouseover="this.style.color='#fff'" onmouseout="this.style.color='#bbb'">
                                        <i class="fas fa-chevron-right" style="margin-right: 8px; font-size: 0.7rem; color: #ff6b6b;"></i> Terms of Service
                                    </a>
                                </li>
                                <li>
                                    <a href="{{ route('policy.pages', ['purchase-policy', 127]) }}" style="color: #bbb; text-decoration: none; transition: color 0.3s; display: flex; align-items: center;" onmouseover="this.style.color='#fff'" onmouseout="this.style.color='#bbb'">
                                        <i class="fas fa-chevron-right" style="margin-right: 8px; font-size: 0.7rem; color: #ff6b6b;"></i> Purchase Policy
                                    </a>
                                </li>
                            </ul>
                        </div>

                        <!-- Contact Us Section -->
                        <div class="col-md-6 col-lg-3">
                            <h4 class="footer__title text--white mt-0" style="color: #fff; font-size: 1.25rem; margin-bottom: 1rem;">Contact Us</h4>
                            <ul class="list-unstyled" style="padding-left: 0; list-style: none; color: #bbb;">
                                <li style="margin-bottom: 1rem; display: flex; align-items: flex-start;">
                                    <i class="fas fa-phone-alt" style="margin-right: 10px; margin-top: 3px; color: #ff6b6b;"></i>
                                    <div>
                                        <a href="tel:8148078285" style="color: #bbb; text-decoration: none; transition: color 0.3s;" onmouseover="this.style.color='#fff'" onmouseout="this.style.color='#bbb'">
                                            81480 78285
                                        </a>
                                    </div>
                                </li>
                                <li style="margin-bottom: 1rem; display: flex; align-items: flex-start;">
                                    <i class="far fa-envelope" style="margin-right: 10px; margin-top: 3px; color: #ff6b6b;"></i>
                                    <div>
                                        <a href="mailto:info@90skalyanam.com" style="color: #bbb; text-decoration: none; transition: color 0.3s;" onmouseover="this.style.color='#fff'" onmouseout="this.style.color='#bbb'">
                                            info@90skalyanam.com
                                        </a>
                                    </div>
                                </li>
                                <li style="display: flex; align-items: flex-start;">
                                    <i class="fas fa-map-marker-alt" style="margin-right: 10px; margin-top: 3px; color: #ff6b6b;"></i>
                                    <span>Pollachi, Tamil Nadu, India</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    
    <!-- Copyright Section -->
    <div class="container" style="border-top: 1px solid #333; padding: 20px 0; margin-top: 30px;">
        <div class="row">
            <div class="col-12">
                <div class="text-center">
                    <p style="color: #888; margin: 0; font-size: 0.9rem;">
                        &copy; <?php echo $currentYear; ?> 90s Kalyanam. All Rights Reserved.
                    </p>
                </div>
            </div>
        </div>
    </div>
</footer>

<!-- Font Awesome for icons -->
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css">
