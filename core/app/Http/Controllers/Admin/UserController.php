<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\UserLimitation;
use App\Models\Package;
use App\Constants\Status;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class UserController extends Controller
{
    /**
     * Delete a gallery image of a user.
     */
    public function deleteGallery($userId, $galleryId)
    {
        $gallery = \App\Models\Gallery::where('user_id', $userId)->where('id', $galleryId)->firstOrFail();

        // Delete the file if exists
        $filePath = public_path('assets/images/user/gallery') . '/' . $gallery->image;
        if (file_exists($filePath)) {
            @unlink($filePath);
        }

        $gallery->delete();

        return back()->withNotify(['success', 'Image deleted successfully']);
    }
    /**
     * Approve or reject a user gallery document (photo, horoscope, id proof)
     */
    public function approveDocument(Request $request, $id)
    {
        $request->validate([
            'action' => 'required|in:approve,reject'
        ]);
        $gallery = \App\Models\Gallery::findOrFail($id);
        $gallery->status = $request->action == 'approve' ? \App\Models\Gallery::STATUS_APPROVED : \App\Models\Gallery::STATUS_REJECTED;
        $gallery->save();
        if($request->ajax()){
            return response()->json(['status'=>'success','message'=>'Document status updated']);
        }
        return back()->withNotify(['success','Document status updated']);
    }
    /**
     * Display a listing of members whose paid plan is expired.
     */
    public function expired(Request $request)
    {
        $pageTitle = 'Plan Expired Members';
        $users = User::with(['limitation.package','basicInfo', 'basicInfo.religionInfo'])
            ->whereHas('limitation', function($q){
                $q->whereNotNull('expire_date')
                  ->where('expire_date', '<', now());
            })
            ->paginate(12);
        $packages = Package::all(['id','name']);
        return view('admin.users.expired', compact('pageTitle','users','packages'));
    }

    public function index(Request $request)
    {
        $pageTitle = 'Manage Member - ALL';
        $query = User::with(['limitation.package', 'basicInfo', 'basicInfo.religionInfo', 'staff']);
        
        // Search functionality
        if ($request->search) {
            $query->where(function($q) use ($request) {
                $q->where('firstname', 'like', "%{$request->search}%")
                  ->orWhere('lastname', 'like', "%{$request->search}%")
                  ->orWhere('email', 'like', "%{$request->search}%")
                  ->orWhere('mobile', 'like', "%{$request->search}%")
                  ->orWhere(DB::raw("CONCAT(firstname, ' ', lastname)"), 'like', "%{$request->search}%");
            });
        }
        
        // Status filter
        if ($request->status) {
            if ($request->status == 'unapproved') {
                $query->where('status', Status::USER_UNAPPROVED)
                      ->whereHas('limitation', function($q){
                          $q->where('package_id', 4);
                      });
            } elseif ($request->status == 'paid') {
                $query->where('status', Status::USER_ACTIVE)
                       ->whereHas('limitation', function($q){
                          $q->whereIn('package_id',[1,2,3]);
                       });
            } elseif ($request->status == 'approved') {
                // Approved = active users on FREE package only
                $query->where('status', Status::USER_ACTIVE)
                      ->whereHas('limitation', function($q){
                          $q->where('package_id', 4);
                      });
            } elseif ($request->status == 'suspended') {
                $query->where('status', Status::USER_BAN)
                      ->whereHas('limitation', function($q) {
                          $q->where('package_id', '!=', 4);
                      });
            }
        }
        
        // Sorting
        $sort = $request->sort ?? 'latest';
        if ($sort == 'latest' || $sort == 'desc') {
            $query->orderBy('id', 'desc');
        } elseif ($sort == 'asc') {
            $query->orderBy('id', 'asc');
        } elseif ($sort == 'today') {
            $query->whereDate('created_at', now()->toDateString())->orderBy('id', 'desc');
        }
        
        // Pagination
        $perPage = $request->per_page ?? 10;
        $users = $query->paginate($perPage);

        // Packages for modal dropdown
        $packages = Package::all(['id','name']);
        
        // Counts for filter tabs
        $counts = [
            'all' => User::count(),
            'approved' => User::where('status', Status::USER_ACTIVE)
                ->whereHas('limitation', function($q){
                    $q->where('package_id',4);
                })->count(),
            'unapproved' => User::where('status', Status::USER_UNAPPROVED)
                ->whereHas('limitation', function($q){
                    $q->where('package_id',4);
                })->count(),
            'paid' => User::whereHas('limitation', function($q) {
                $q->whereIn('package_id', [1,2,3]); // Only paid packages
            })->count(),
            'suspended' => User::where('status', Status::USER_BAN)
                ->whereHas('limitation', function($q) {
                    $q->where('package_id', '!=', 4);
                })->count(),
        ];
        
        return view('admin.users.index', compact('pageTitle', 'users', 'counts','packages'));
    }
    
    public function create()
    {
        $pageTitle = 'Add New Member';
        $packages = Package::where('status', Status::ENABLE)->get();
        $staffs = \App\Models\Admin::all();
        // No user object for create, just pass staffs and packages
        return view('admin.users.create', compact('pageTitle', 'packages', 'staffs'));
    }

    public function store(Request $request)
    {
        $request->validate([
            'firstname' => 'required|string|max:255',
            'lastname' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'mobile' => 'required|string|unique:users,mobile',
            'password' => 'required|min:6',
            'gender' => 'nullable|in:Male,Female',
            'marital_status' => 'nullable|in:Unmarried,Divorced,Widowed,Separated',
            'body_type' => 'nullable|in:Slim,Average,Athletic,Heavy',
            'complexion' => 'nullable|in:Fair,Medium,Wheatish,Dark',
            'blood_group' => 'nullable|in:A+,A-,B+,B-,AB+,AB-,O+,O-',
            'physical_status' => 'nullable|in:Normal,Physically Challenged',
            'family_type' => 'nullable|in:Nuclear,Joint',
            'mother_tongue'  => 'nullable|string|max:100',
            'religion_id'    => 'nullable|exists:religion_infos,id',
            'caste'          => 'nullable|string|max:255',
            'profile_photo'      => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'gallery_images.*' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'horoscope_photo' => 'nullable|image|mimes:jpeg,png,jpg,gif,bmp|max:5120',
            'id_proof_photo' => 'nullable|image|mimes:jpeg,png,jpg,gif,bmp|max:5120'
        ], [
            'gender.in' => 'Gender must be Male or Female.',
            'marital_status.in' => 'Select a valid marital status.',
            'body_type.in' => 'Select a valid body type.',
            'complexion.in' => 'Select a valid complexion.',
            'blood_group.in' => 'Select a valid blood group.',
            'physical_status.in' => 'Select a valid physical status.',
            'family_type.in' => 'Select a valid family type.',
            'religion_id.exists' => 'Select a valid religion.',
            'gallery_images.*.image' => 'Each gallery file must be an image.',
            'gallery_images.*.mimes' => 'Gallery images must be jpeg, png, jpg, or gif.',
            'gallery_images.*.max' => 'Gallery images must not exceed 2MB each.',
        ]);

        $authAdmin = auth()->guard('admin')->user();
        $canManagePlan = $authAdmin && $authAdmin->hasRole('Super Admin');
        $selectedPackageId = $canManagePlan ? $request->package_id : null;
        if (!$canManagePlan) {
            $selectedPackageId = $selectedPackageId ?: gs()->default_package_id;
        }
        $selectedPackage = $selectedPackageId ? Package::find($selectedPackageId) : null;

        $user = new User();
        $user->firstname = $request->firstname;
        $user->lastname = $request->lastname;
        $user->email = $request->email;
        $user->mobile = $request->mobile;
        $user->profile_id = getNumber(8);
        $user->username = Str::slug(explode('@', $request->email)[0]) . rand(1000,9999);
        $user->country_code = 'IN';
        $user->ev = Status::VERIFIED;
        $user->sv = Status::VERIFIED;
        $user->kv = Status::VERIFIED;
        $user->looking_for = $request->looking_for ?? ($request->gender == 'Male' ? 2 : 1);
        $user->password = bcrypt($request->password);
        // Determine initial status based on selected package
        if ($selectedPackage) {
            if (in_array($selectedPackage->id, [1,2,3])) { // paid packages
                $user->status = Status::USER_ACTIVE;
            } elseif ($selectedPackage->id == 4) {        // free plan
                $user->status = Status::USER_UNAPPROVED;
            } else {
                $user->status = Status::USER_UNAPPROVED;
            }
        } else {
            // No package selected defaults to unapproved so admin can review later
            $user->status = Status::USER_UNAPPROVED;
        }
        $user->assigned_staff = $request->assigned_staff;
        $user->assigned_franchise = $request->assigned_franchise;
        
        // Mark profile as complete so user is not forced to fill registration forms
        $user->profile_complete = 1;

        // Persist address object for new user
        $user->address = (object) [
            'address' => $request->address,
            'pincode' => $request->pincode,
        ];
        $user->save();

        // Create basic info
        $user->basicInfo()->create([
            'gender'         => $request->gender,
            'marital_status' => $request->marital_status,
            'mother_tongue'  => $request->mother_tongue,
            'birth_date'     => $request->birth_date,
            'religion_id'    => $request->religion_id,
            'caste'          => $request->caste,
            // Store religion name redundantly for easy access like in update()
            'religion'       => optional(\App\Models\ReligionInfo::find($request->religion_id))->name,
            'country'        => $request->country,
            'state'          => $request->state,
            'city'           => $request->city,
        ]);

        // Create physical attributes
        $user->physicalAttributes()->create([
            'height' => $request->height,
            'weight' => $request->weight,
            'body_type' => $request->body_type,
            'complexion' => $request->complexion,
            'blood_group' => $request->blood_group,
            'physical_status' => $request->physical_status,
        ]);

        // Create family info
        $user->family()->create([
            'father_name' => $request->father_name,
            'mother_name' => $request->mother_name,
            'family_type' => $request->family_type,
            'family_status' => $request->family_status,
            'family_values' => $request->family_values,
            'siblings' => $request->siblings,
        ]);

        // Create education info (multiple)
        if ($request->education) {
            foreach ($request->education as $edu) {
                $user->educationInfo()->create([
                    'degree' => $edu['degree'] ?? null,
                    'institution' => $edu['institution'] ?? null,
                    'year' => $edu['year'] ?? null,
                ]);
            }
        }

        // Create career info (multiple)
        if ($request->career) {
            foreach ($request->career as $career) {
                $user->careerInfo()->create([
                    'designation' => $career['designation'] ?? null,
                    'company' => $career['company'] ?? null,
                    'years' => $career['years'] ?? null,
                ]);
            }
        }

        // Create partner expectation
        $user->partnerExpectation()->create([
            'age_range' => $request->partner_age_range,
            'height_range' => $request->partner_height_range,
            'religion' => $request->partner_religion,
            'caste' => $request->partner_caste,
            'education' => $request->partner_education,
            'occupation' => $request->partner_occupation,
            'other' => $request->partner_other,
        ]);

        // Create limitation with expiry
        if ($selectedPackage) {
            $expired_at = null;
            if ($selectedPackage->validity_days) {
                $expired_at = now()->addDays($selectedPackage->validity_days);
            }
            
            $validity_period = ($selectedPackage->validity_days > 0) ? $selectedPackage->validity_days : -1;
            
            $user->limitation()->create([
                'package_id' => $selectedPackage->id,
                'interest_express_limit' => $selectedPackage->interest_express_limit ?? 0,
                'contact_view_limit'   => $selectedPackage->contact_view_limit ?? 0,
                'image_upload_limit'   => $selectedPackage->image_upload_limit ?? 0,
                'validity_period'      => $validity_period,
                'expired_at'           => $expired_at,
            ]);
        }

        // Ensure gallery directory exists
        $galleryPath = public_path('assets/images/user/gallery');
        if(!is_dir($galleryPath)){
            mkdir($galleryPath,0755,true);
        }

        // Handle profile photo upload
        if ($request->hasFile('profile_photo')) {
            $image = $request->file('profile_photo');
            $filename = uniqid('profile_') . '.' . $image->getClientOriginalExtension();
            $image->move($galleryPath, $filename);

            // Reset previous profile pictures
            $user->galleries()->update(['is_profile' => false]);

            $user->galleries()->create([
                'image'      => $filename,
                'type'       => \App\Models\Gallery::TYPE_PHOTO,
                'status'     => \App\Models\Gallery::STATUS_APPROVED, // directly approved as admin upload
                'is_profile' => true,
            ]);
        }

        // Handle gallery images
        if ($request->hasFile('gallery_images')) {
            foreach ($request->file('gallery_images') as $image) {
                $filename = uniqid('gallery_').'.'.$image->getClientOriginalExtension();
                $image->move($galleryPath, $filename);
                $user->galleries()->create(['image' => $filename]);
            }
        }

        // Handle horoscope upload
        if ($request->hasFile('horoscope_photo')) {
            $image = $request->file('horoscope_photo');
            $filename = uniqid('horoscope_') . '.' . $image->getClientOriginalExtension();
            $image->move($galleryPath, $filename);
            $user->galleries()->create([
                'image' => $filename,
                'type'  => \App\Models\Gallery::TYPE_HOROSCOPE,
                'status'=> \App\Models\Gallery::STATUS_PENDING,
            ]);
            // store on basic info
            $basic = $user->basicInfo ?: $user->basicInfo()->create([]);
            $basic->horoscope_file = $filename;
            $basic->save();
        }

        // Handle ID proof upload
        if ($request->hasFile('id_proof_photo')) {
            $image = $request->file('id_proof_photo');
            $filename = uniqid('idproof_') . '.' . $image->getClientOriginalExtension();
            $image->move($galleryPath, $filename);
            $user->galleries()->create([
                'image' => $filename,
                'type'  => \App\Models\Gallery::TYPE_ID_PROOF,
                'status'=> \App\Models\Gallery::STATUS_PENDING,
            ]);
            $basic = $user->basicInfo ?: $user->basicInfo()->create([]);
            $basic->id_proof_file = $filename;
            $basic->save();
        }

        return redirect()->route('admin.users.index')->with('success', 'Member added successfully');
    }
    
    public function edit($id)
    {
        $user = User::with([
            'limitation.package',
            'basicInfo', 'basicInfo.religionInfo',
            'physicalAttributes',
            'family',
            'educationInfo',
            'careerInfo',
            'partnerExpectation',
            'galleries',
            'interests',
            'contacts',
        ])->findOrFail($id);
        $pageTitle = 'Edit Member: ' . $user->firstname . ' ' . $user->lastname;
        $packages = Package::where('status', Status::ENABLE)->get();
        $staffs = \App\Models\Admin::all();

        // Calculate summary card values
        $interestLimit = $user->limitation->interest_express_limit ?? 0;
        $interestsSent = $user->interests->count();
        $remainingInterests = $interestLimit == -1 ? 'Unlimited' : max(0, $interestLimit - $interestsSent);
        $profileVisits = $user->contacts->count(); // assuming contacts relation logs profile views
        $imageLimit = $user->limitation->image_upload_limit ?? 0;
        $imagesUploaded = $user->galleries->where('type', \App\Models\Gallery::TYPE_PHOTO)->count();

        return view('admin.users.edit', compact(
            'pageTitle', 'user', 'packages', 'staffs',
            'remainingInterests', 'profileVisits', 'imagesUploaded', 'imageLimit'
        ));
    }
    
    public function update(Request $request, $id)
    {
        $request->validate([
            'firstname' => 'required|string|max:255',
            'lastname' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,'.$id,
            'mobile' => 'required|string|unique:users,mobile,'.$id,
            'gender' => 'nullable|in:Male,Female',
            'looking_for' => 'nullable|in:1,2',
            'marital_status' => 'nullable|in:Unmarried,Divorced,Widowed,Separated',
            'body_type' => 'nullable|in:Slim,Average,Athletic,Heavy',
            'complexion' => 'nullable|in:Fair,Medium,Wheatish,Dark',
            'blood_group' => 'nullable|in:A+,A-,B+,B-,AB+,AB-,O+,O-',
            'physical_status' => 'nullable|in:Normal,Physically Challenged',
            'family_type' => 'nullable|in:Nuclear,Joint',
            'mother_tongue'  => 'nullable|string|max:100',
            'religion_id'    => 'nullable|exists:religion_infos,id',
            'caste'          => 'nullable|string|max:255',
            'profile_photo'      => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'gallery_images.*' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'horoscope_photo' => 'nullable|image|mimes:jpeg,png,jpg,gif,bmp|max:5120',
            'id_proof_photo' => 'nullable|image|mimes:jpeg,png,jpg,gif,bmp|max:5120'
        ], [
            'gender.in' => 'Gender must be Male or Female.',
            'looking_for.in' => 'Looking For must be Bridegroom (1) or Bride (2).',
            'marital_status.in' => 'Select a valid marital status.',
            'body_type.in' => 'Select a valid body type.',
            'complexion.in' => 'Select a valid complexion.',
            'blood_group.in' => 'Select a valid blood group.',
            'physical_status.in' => 'Select a valid physical status.',
            'family_type.in' => 'Select a valid family type.',
            'religion_id.exists' => 'Select a valid religion.',
            'gallery_images.*.image' => 'Each gallery file must be an image.',
            'gallery_images.*.mimes' => 'Gallery images must be jpeg, png, jpg, or gif.',
            'gallery_images.*.max' => 'Gallery images must not exceed 2MB each.',
        ]);

        $user = User::findOrFail($id);
        $authAdmin = auth()->guard('admin')->user();
        $canManagePlan = $authAdmin && $authAdmin->hasRole('Super Admin');
        // Map simple scalar fields
        $user->firstname          = $request->firstname;
        $user->lastname           = $request->lastname;
        $user->email              = $request->email;
        $user->mobile             = $request->mobile;
        // Only update account status if an explicit numeric value is submitted
if ($request->filled('status') && is_numeric($request->input('status'))) {
    $user->status = (int) $request->input('status');
}
        $user->assigned_staff     = $request->assigned_staff;
        $user->assigned_franchise = $request->assigned_franchise;
        
        // Update looking_for field if provided
        if ($request->filled('looking_for')) {
            $user->looking_for = $request->looking_for;
        }

        // Persist address object (used by Blade as $user->address->address & pincode)
        $user->address = (object) [
            'address'  => $request->address,
            'pincode'  => $request->pincode,
        ];

        if ($request->password) {
            $user->password = bcrypt($request->password);
        }

        // Save only if something actually changed. This prevents the timestamp update from
        // causing a false-positive change detection when the admin submits the form without
        // modifying any field.
        $userChanged = $user->isDirty();
        if ($userChanged) {
            $user->save();
        }
        
        // Update basic info
        $basicInfo = $user->basicInfo()->updateOrCreate(
            ['user_id' => $user->id],
            [
                'gender'         => $request->gender,
                'marital_status' => $request->marital_status,
                'mother_tongue'  => $request->mother_tongue,
                'birth_date'     => $request->birth_date,
                'religion_id'    => $request->religion_id,
                'caste'          => $request->caste,
                'religion'       => optional(\App\Models\ReligionInfo::find($request->religion_id))->name,
                'country'        => $request->country,
                'state'          => $request->state,
                'city'           => $request->city,
            ]
        );
        $basicChanged = $basicInfo->wasRecentlyCreated || $basicInfo->wasChanged();
        
        // ---------------- Physical Attributes ----------------
        $physical = $user->physicalAttributes()->updateOrCreate(
            ['user_id' => $user->id],
            [
                'height'          => $request->height,
                'weight'          => $request->weight,
                'body_type'       => $request->body_type,
                'complexion'      => $request->complexion,
                'blood_group'     => $request->blood_group,
                'physical_status' => $request->physical_status,
            ]
        );
        $physicalChanged = $physical->wasRecentlyCreated || $physical->wasChanged();

        // ---------------- Family ----------------
        $family = $user->family()->updateOrCreate(
            ['user_id' => $user->id],
            [
                'father_name'   => $request->father_name,
                'mother_name'   => $request->mother_name,
                'family_type'   => $request->family_type,
                'family_status' => $request->family_status,
                'family_values' => $request->family_values,
                'siblings'      => $request->siblings,
            ]
        );
        $familyChanged = $family->wasRecentlyCreated || $family->wasChanged();

        // ---------------- Education Infos ----------------
        $eduInput = $request->input('education', []);
        $existingEdu = $user->educationInfo()->count();
        $user->educationInfo()->delete();
        foreach ($eduInput as $edu) {
            if (empty(array_filter($edu))) { // skip empty rows
                continue;
            }
            $user->educationInfo()->create($edu);
        }
        $educationChanged = $existingEdu !== count($eduInput);

        // ---------------- Career Infos ----------------
        $careerInput = $request->input('career', []);
        $existingCareer = $user->careerInfo()->count();
        $user->careerInfo()->delete();
        foreach ($careerInput as $car) {
            if (empty(array_filter($car))) {
                continue;
            }
            $user->careerInfo()->create($car);
        }
        $careerChanged = $existingCareer !== count($careerInput);

        // ---------------- Profile Photo Upload ----------------
        $profileChanged = false;
        if ($request->hasFile('profile_photo')) {
            // Upload to user profile directory & resize
            $filename = fileUploader(
                $request->file('profile_photo'),
                base_path('../'.getFilePath('userProfile')),
                getFileSize('userProfile'),
                $user->image // delete old
            );

            // Update user's primary image so frontend uses the new one
            $user->image = $filename;
            $user->save();

            // Also keep a copy in gallery folder for admin gallery views
            $galleryPath = public_path('assets/images/user/gallery');
            if (!file_exists($galleryPath)) {
                @mkdir($galleryPath, 0755, true);
            }
            @copy(base_path('../'.getFilePath('userProfile')) . '/' . $filename, $galleryPath . '/' . $filename);

            // Reset previous profile pictures in gallery
            $user->galleries()->update(['is_profile' => false]);

            // Create/insert profile image record into galleries
            $user->galleries()->create([
                'image'      => $filename,
                'type'       => \App\Models\Gallery::TYPE_PHOTO,
                'status'     => \App\Models\Gallery::STATUS_APPROVED,
                'is_profile' => true,
            ]);
            $profileChanged = true;
        }

        // ---------------- Document Uploads (Horoscope & ID Proof) ----------------
        $docChanged = false;

        // Handle horoscope upload
        if ($request->hasFile('horoscope_photo')) {
            $image = $request->file('horoscope_photo');
            $filename = uniqid('horoscope_') . '.' . $image->getClientOriginalExtension();
            $image->move(public_path('assets/images/user/gallery'), $filename);

            $existing = $user->galleries()->where('type', \App\Models\Gallery::TYPE_HOROSCOPE)->first();
            if ($existing) {
                // Update the existing record and reset status to pending
                $existing->image = $filename;
                $existing->status = \App\Models\Gallery::STATUS_PENDING;
                $existing->save();
            } else {
                $user->galleries()->create([
                    'image'  => $filename,
                    'type'   => \App\Models\Gallery::TYPE_HOROSCOPE,
                    'status' => \App\Models\Gallery::STATUS_PENDING,
                ]);
            }
            $docChanged = true;
        }

        // Handle ID proof upload
        if ($request->hasFile('id_proof_photo')) {
            $image = $request->file('id_proof_photo');
            $filename = uniqid('idproof_') . '.' . $image->getClientOriginalExtension();
            $image->move(public_path('assets/images/user/gallery'), $filename);

            $existing = $user->galleries()->where('type', \App\Models\Gallery::TYPE_ID_PROOF)->first();
            if ($existing) {
                $existing->image = $filename;
                $existing->status = \App\Models\Gallery::STATUS_PENDING;
                $existing->save();
            } else {
                $user->galleries()->create([
                    'image'  => $filename,
                    'type'   => \App\Models\Gallery::TYPE_ID_PROOF,
                    'status' => \App\Models\Gallery::STATUS_PENDING,
                ]);
            }
            $docChanged = true;
        }

        // ---------------- Partner Expectation ----------------
        $partner = $user->partnerExpectation()->updateOrCreate(
            ['user_id' => $user->id],
            [
                'age_range'   => $request->partner_age_range,
                'height_range'=> $request->partner_height_range,
                'religion'    => $request->partner_religion,
                'caste'       => $request->partner_caste,
                'education'   => $request->partner_education,
                'occupation'  => $request->partner_occupation,
                'other'       => $request->partner_other,
            ]
        );
        $partnerChanged = $partner->wasRecentlyCreated || $partner->wasChanged();
        
        // Update limitation with expiry
        if ($canManagePlan && $request->filled('package_id')) {
            $package = Package::find($request->package_id);
            $expired_at = null;
            if ($package && $package->validity_days) {
                $expired_at = now()->addDays($package->validity_days);
            }
            if ($package) {
                $validity_period = ($package->validity_days > 0) ? $package->validity_days : -1;
                
                $limitation = $user->limitation()->updateOrCreate(
                    ['user_id' => $user->id],
                    [
                        'package_id' => $package->id,
                        'interest_express_limit' => $package->interest_express_limit ?? 0,
                        'contact_view_limit' => $package->contact_view_limit ?? 0,
                        'image_upload_limit' => $package->image_upload_limit ?? 0,
                        'validity_period' => $validity_period,
                        'expired_at' => $expired_at,
                    ]
                );
                $limitChanged = $limitation->wasRecentlyCreated || $limitation->wasChanged();

                if (in_array($package->id, [1,2,3])) {
                    $user->status = Status::USER_ACTIVE;
                } elseif ($package->id == 4) {
                    $user->status = Status::USER_UNAPPROVED;
                }
                
                // Save user status change
                $user->save();
            }
        }
        
        $anyChange = ($userChanged ?? false) || ($basicChanged ?? false) || ($physicalChanged ?? false) || ($familyChanged ?? false) || ($educationChanged ?? false) || ($careerChanged ?? false) || ($partnerChanged ?? false) || ($limitChanged ?? false) || ($docChanged ?? false) || ($profileChanged ?? false);
        $redirect = redirect()->route('admin.users.index');
        return $anyChange ? $redirect->with('success','Member updated successfully') : $redirect;
    }
    
    public function bulkAction(Request $request)
    {
        $request->validate([
            'action' => 'required|in:delete,approve,unapprove,suspend',
            'member_ids' => 'required|array',
            'member_ids.*' => 'exists:users,id',
        ]);
        
        $action = $request->action;
        $memberIds = $request->member_ids;
        
        if ($action == 'delete') {
            User::whereIn('id', $memberIds)->delete();
            return back()->with('success', 'Selected members deleted successfully');
        } elseif ($action == 'approve') {
            User::whereIn('id', $memberIds)->update(['status' => Status::USER_ACTIVE]);
            return back()->with('success', 'Selected members approved successfully');
        } elseif ($action == 'unapprove') {
            User::whereIn('id', $memberIds)->update(['status' => Status::USER_UNAPPROVED]);
            return back()->with('success', 'Selected members unapproved successfully');
        } elseif ($action == 'suspend') {
            User::whereIn('id', $memberIds)->update(['status' => Status::USER_BAN]);
            return back()->with('success', 'Selected members suspended successfully');
        }
        
        return back()->with('error', 'Invalid action');
    }
    
    public function confirmEmail($id)
    {
        $user = User::findOrFail($id);
        $user->ev = Status::VERIFIED;
        $user->save();
        
        return back()->with('success', 'Email confirmed successfully');
    }
    
    public function addComment(Request $request, $id)
    {
        $request->validate([
            'comment' => 'required|string',
        ]);
        
        $user = User::findOrFail($id);
        $user->comments()->create([
            'comment' => $request->comment,
            'admin_id' => auth()->guard('admin')->id(),
        ]);
        
        return back()->with('success', 'Comment added successfully');
    }
    
    public function viewComments($id)
    {
        $user = User::with('comments.admin')->findOrFail($id);
        $pageTitle = 'Comments for ' . $user->firstname . ' ' . $user->lastname;
        
        return view('admin.users.comments', compact('pageTitle', 'user'));
    }
    
    public function viewProfile($id)
    {
        $user = User::with([
            'limitation.package',
            'basicInfo', 'basicInfo.religionInfo',
            'physicalAttributes',
            'family',
            'educationInfo',
            'careerInfo',
            'partnerExpectation',
            'galleries',
            'comments.admin',
        ])->findOrFail($id);
        $pageTitle = 'Profile: ' . $user->firstname . ' ' . $user->lastname;
        return view('admin.users.profile', compact('pageTitle', 'user'));
    }
    
    public function advancedSearch(Request $request)
    {
        $query = User::with(['limitation.package', 'basicInfo', 'basicInfo.religionInfo', 'staff']);
        
        // Add advanced filters here (gender, age, etc.)
        if ($request->gender) {
            $query->whereHas('basicInfo', function($q) use ($request) {
                $q->where('gender', $request->gender);
            });
        }
        
        if ($request->keyword) {
            $query->where(function($q) use ($request) {
                $q->where('firstname', 'like', "%{$request->keyword}%")
                  ->orWhere('lastname', 'like', "%{$request->keyword}%")
                  ->orWhere('email', 'like', "%{$request->keyword}%");
            });
        }
        
        // ... add more filters as needed
        $users = $query->paginate(12);
        return view('admin.users.advanced_search', compact('users'));
    }
    
    public function activeToPaid(Request $request)
    {
        $pageTitle = 'Approved Members';
        $query = User::with(['limitation.package','basicInfo', 'basicInfo.religion'])
            ->where('status', Status::USER_ACTIVE)
            ->whereHas('limitation', function($q){
                $q->where('package_id',4); // free plan (approved)
            });
        // quick search (name, email, mobile, profile id)
        if($request->filled('search')){
            $s = trim($request->search);
            $query->where(function($q) use ($s){
                $q->where('firstname','like',"%{$s}%")
                  ->orWhere('lastname','like',"%{$s}%")
                  ->orWhere('email','like',"%{$s}%")
                  ->orWhere('mobile','like',"%{$s}%")
                  ->orWhere(DB::raw("CONCAT(firstname,' ',lastname)"),'like',"%{$s}%");
            });
        }
        // package filter
        if($request->filled('package')){
            $pkg = $request->package;
            $query->whereHas('limitation', function($q) use ($pkg){
                $q->where('package_id',$pkg);
            });
        }
        // state filter via basicInfo
        if($request->filled('state')){
            $state = $request->state;
            $query->whereHas('basicInfo', function($q) use ($state){
                $q->where('state',$state);
            });
        }
        $users = $query->paginate(12)->appends($request->all());
        $packages = Package::all(['id','name']);
        $states = \App\Models\State::orderBy('name')->pluck('name');
        return view('admin.users.active_to_paid', compact('pageTitle','users','packages','states'));
    }
    




    public function bulkAddForm()
    {
        $pageTitle='Bulk User Add';
        return view('admin.users.bulk_add',compact('pageTitle'));
    }

    public function bulkAddSample()
    {
        $path = resource_path('sample_users.csv');
        return response()->download($path,'sample_users_template.csv');
    }

    public function bulkAddPreview(Request $request)
    {
        $request->validate([
            'file'=>'required|mimes:csv,txt|max:10240'
        ]);
        $filePath = $request->file('file')->store('tmp');
        $fullPath = storage_path('app/'.$filePath);
        if(!($handle=fopen($fullPath,'r'))){
            return back()->with('error','Cannot read file');
        }
        $headers = fgetcsv($handle);
        $rows=[];
        $previewLimit = 100; // show only first 100 rows in preview
        $totalRows = 0;
        while(($row = fgetcsv($handle)) !== false){
            $totalRows++;
            if(count($rows) >= $previewLimit){
                // skip storing additional rows for preview speed
                continue;
            }
            // Normalize column count to match headers
            if (count($row) < count($headers)) {
                $row = array_pad($row, count($headers), null);
            } elseif (count($row) > count($headers)) {
                $row = array_slice($row, 0, count($headers));
            }
            $combined = array_map('trim', array_combine($headers, $row));
            // skip if every value empty or required basics missing
            if (empty($combined['email']) && empty($combined['firstname']) && empty($combined['lastname'])) {
                continue;
            }
            $rows[] = $combined;
        }
        fclose($handle);
        $tmp = $filePath; // pass to view
        $pageTitle='Bulk User Add Preview';
        return view('admin.users.bulk_add',compact('pageTitle','rows','tmp','totalRows','previewLimit'));
    }

    public function bulkAddStore(Request $request)
    {
        // Allow very large CSV imports (thousands of rows)
        set_time_limit(0);               // no execution time limit
        ini_set('memory_limit', '-1');   // remove memory limit for this request (CLI/web)

        if($request->filled('tmp')){
            $filePath = $request->tmp;
        }else{
            $request->validate(['file'=>'required|mimes:csv,txt|max:10240']);
            $filePath = $request->file('file')->store('tmp');
        }
        $fullPath = storage_path('app/'.$filePath);
        if(!($handle = fopen($fullPath,'r'))){
            DB::rollBack();
            return back()->with('error','Unable to open the uploaded file');
        }
        $headers = fgetcsv($handle);
        $success = 0; $failed = 0;
        // Wrap whole import in a single transaction for speed & atomicity
        DB::beginTransaction();
        while (($row = fgetcsv($handle)) !== false) {
            // Normalize column count similar to preview
            if (count($row) < count($headers)) {
                $row = array_pad($row, count($headers), null);
            } elseif (count($row) > count($headers)) {
                $row = array_slice($row, 0, count($headers));
            }
            $data = array_map('trim', array_combine($headers, $row));
            // skip completely blank rows
            if (empty($data['email']) && empty($data['firstname']) && empty($data['lastname'])) {
                continue;
            }
            // basic mandatory fields validation
            if (empty($data['email']) || empty($data['firstname']) || empty($data['lastname'])) {
                $failed++; continue;
            }
            if (User::where('email', $data['email'])->exists()) { $failed++; continue; }
            try {
                /* ---------- Core User ---------- */
                $user = new User();
                $user->firstname = $data['firstname'];
                $user->lastname  = $data['lastname'];
                // looking_for: 1=Bridegroom,2=Bride; opposite of user's gender
                $user->looking_for = isset($data['looking_for']) && in_array($data['looking_for'], [1,2])
                    ? $data['looking_for']
                    : (strtolower($data['gender']??'') == 'male' ? 2 : 1);
                $user->email     = $data['email'];
                $user->mobile    = $data['mobile'] ?? null;
                $user->profile_id = getNumber(8);
                $user->username   = Str::slug(explode('@', $data['email'])[0]) . rand(1000,9999);
                $user->password  = bcrypt($data['password'] ?? 'password');
                $user->country_code = 'IN';
                $user->ev = Status::VERIFIED;
                $user->sv = Status::VERIFIED;
                $user->kv = Status::VERIFIED;
                $user->status    = in_array(($data['package_id'] ?? null), [1,2,3]) ? Status::USER_ACTIVE : Status::USER_UNAPPROVED;
                $user->assigned_staff     = $data['assigned_staff']     ?? null;
                $user->assigned_franchise = $data['assigned_franchise'] ?? null;
                // Mark profile as complete so user is not forced to fill registration forms
                $user->profile_complete = 1;
                $user->address = (object) [
                    'address' => $data['address'] ?? null,
                    'pincode' => $data['pincode'] ?? null,
                ];
                $user->save();

                /* ---------- Basic Info ---------- */
                $user->basicInfo()->create([
                    'gender'         => $data['gender'] ?? null,
                    'marital_status' => $data['marital_status'] ?? null,
                    'mother_tongue'  => $data['mother_tongue'] ?? null,
                    'birth_date'     => isset($data['birth_date']) ? (\Carbon\Carbon::parse(str_replace(['/','-'], '-', $data['birth_date']))->format('Y-m-d')) : null,
                    'religion_id'    => $data['religion_id'] ?? null,
                    'caste'          => $data['caste'] ?? null,
                    'religion'       => optional(\App\Models\ReligionInfo::find($data['religion_id'] ?? null))->name,
                    'country'        => $data['country'] ?? null,
                    'state'          => $data['state'] ?? null,
                    'city'           => $data['city'] ?? null,
                ]);

                /* ---------- Physical Attributes ---------- */
                if (isset($data['height']) || isset($data['weight']) || isset($data['body_type'])) {
                    $user->physicalAttributes()->create([
                        'height'          => $data['height'] ?? null,
                        'weight'          => $data['weight'] ?? null,
                        'body_type'       => $data['body_type'] ?? null,
                        'complexion'      => $data['complexion'] ?? null,
                        'blood_group'     => $data['blood_group'] ?? null,
                        'physical_status' => $data['physical_status'] ?? null,
                    ]);
                }

                /* ---------- Family ---------- */
                if (isset($data['father_name']) || isset($data['mother_name'])) {
                    $user->family()->create([
                        'father_name'   => $data['father_name'] ?? null,
                        'mother_name'   => $data['mother_name'] ?? null,
                        'family_type'   => $data['family_type'] ?? null,
                        'family_status' => $data['family_status'] ?? null,
                        'family_values' => $data['family_values'] ?? null,
                        'siblings'      => $data['siblings'] ?? null,
                    ]);
                }

                /* ---------- Package & Limitation ---------- */
                if (!empty($data['package_id'])) {
                    $package = Package::find($data['package_id']);
                    $expired_at = null;
                    if ($package && $package->validity_days) {
                        $expired_at = now()->addDays($package->validity_days);
                    }
                    
                    $validity_period = ($package->validity_days > 0) ? $package->validity_days : -1;
                    
                    $user->limitation()->create([
                        'package_id'             => $data['package_id'],
                        'interest_express_limit' => $package->interest_express_limit ?? 0,
                        'contact_view_limit'     => $package->contact_view_limit ?? 0,
                        'image_upload_limit'     => $package->image_upload_limit ?? 0,
                        'validity_period'        => $validity_period,
                        'expired_at'             => $expired_at,
                    ]);
                }

                $success++;
            } catch (\Exception $e) {
                $failed++;
            }
        }
        fclose($handle);
        Storage::delete($filePath);
        DB::commit();
        return redirect()->route('admin.users.bulk-add')->with('success', "$success users imported, $failed skipped.");
    }

    public function expiredMembers(Request $request)
    {
        $pageTitle = 'Expired Members';
        $users = User::with(['limitation.package','basicInfo', 'basicInfo.religion'])
            ->whereHas('limitation', function($q){
                $q->whereNotNull('expire_date')
                  ->where('expire_date','<', now());
            })
            ->paginate(12);
        return view('admin.users.expired_members', compact('pageTitle','users'));
    }

    public function changeMembershipPlan(Request $request)
    {
        $pageTitle = 'Change Membership Plan';
        $packageFilter = $request->filled('package') ? (int) $request->input('package') : null;
        $search = trim((string) $request->input('search'));

        $usersQuery = User::with(['limitation.package', 'basicInfo', 'basicInfo.religion'])
            ->where('status', Status::USER_ACTIVE)
            ->whereHas('limitation', function ($q) use ($packageFilter) {
                $q->whereIn('package_id', [1, 2, 3]);
                if ($packageFilter) {
                    $q->where('package_id', $packageFilter);
                }
            });

        if ($search !== '') {
            $usersQuery->where(function ($query) use ($search) {
                $likeSearch = "%{$search}%";
                $query->where('username', 'like', $likeSearch)
                    ->orWhere('firstname', 'like', $likeSearch)
                    ->orWhere('lastname', 'like', $likeSearch)
                    ->orWhereRaw("CONCAT_WS(' ', firstname, lastname) LIKE ?", [$likeSearch])
                    ->orWhere('email', 'like', $likeSearch)
                    ->orWhere('mobile', 'like', $likeSearch);
            });
        }

        $users = $usersQuery->paginate(12)->withQueryString();
        $packages = Package::all(['id','name']);
        return view('admin.users.change_plan', compact('pageTitle','users','packages'));
    }

    public function changePlan(Request $request, $id)
    {
        $request->validate([
            'package_id' => 'required|exists:packages,id',
            'payment_mode' => 'required|string',
            'payment_note' => 'nullable|string',
            'mother_tongue'  => 'nullable|string|max:100',
            'religion_id'    => 'nullable|exists:religion_infos,id',
            'caste'          => 'nullable|string|max:255',
        ]);

        $user = User::findOrFail($id);
        $limitation = $user->limitation ?: new UserLimitation(['user_id'=>$user->id]);
        $package = Package::find($request->package_id);
        $validity = $package->validity_period ?? 0; // -1 for unlimited
        $limitation->package_id = $request->package_id;

        $planInterestExpressLimit = $package->interest_express_limit ?? 0;
        $planContactViewLimit     = $package->contact_view_limit ?? 0;
        $planImageUploadLimit     = $package->image_upload_limit ?? 0;

    if ($limitation->expired_at && $limitation->expired_at >= now()) {
        $limitation->interest_express_limit = ($planInterestExpressLimit == -1 || $limitation->interest_express_limit == -1) ? -1 : $limitation->interest_express_limit + $planInterestExpressLimit;
        $limitation->contact_view_limit     = ($planContactViewLimit == -1 || $limitation->contact_view_limit == -1) ? -1 : $limitation->contact_view_limit + $planContactViewLimit;
    }else{
        $limitation->interest_express_limit = $planInterestExpressLimit;
        $limitation->contact_view_limit     = $planContactViewLimit;
    }
    $limitation->image_upload_limit = $planImageUploadLimit;
    $limitation->validity_period = $validity;
    if($validity == -1){
            $limitation->expired_at = null;
        }else{
            $limitation->expired_at = now()->addDays($validity);
        }
    $limitation->save();

    // Create a comment with payment details
    $user->comments()->create([
        'comment' => "Package changed to {$request->package_id}. Payment mode: {$request->payment_mode}. Note: {$request->payment_note}",
        'admin_id' => auth()->guard('admin')->id(),
    ]);

        if($request->ajax()){
            return response()->json(['status'=>'success','message'=>'Membership plan updated successfully']);
        }
        $notify[] = ['success','Membership plan updated successfully'];
        return back()->with('notify',$notify);
    }

    public function sendConfirmationEmail($id)
    {
        $user = User::findOrFail($id);
        // You can replace this with a custom Mailable if you have one
        Mail::raw('Please confirm your email by clicking the link provided in your account.', function ($message) use ($user) {
            $message->to($user->email)
                ->subject('Email Confirmation');
        });
        // Optionally, you can set ev = 0 to mark as unverified (if not already)
        if ($user->ev != 0) {
            $user->ev = 0;
            $user->save();
        }
        return back()->with('success', 'Confirmation email sent to user successfully.');
    }

    /**
     * Admin upload of ID Proof or Horoscope document.
     */
    public function uploadDocument($id, Request $request)
    {
        $request->validate([
            'document' => ['required','file','mimes:jpeg,png,jpg,pdf','max:2048'],
            'type' => ['required','in:'.\App\Models\Gallery::TYPE_ID_PROOF.','.\App\Models\Gallery::TYPE_HOROSCOPE],
        ]);

        $user = User::findOrFail($id);

        // save file
        $file = $request->file('document');
        $filename = time().'_'.uniqid().'.'.$file->getClientOriginalExtension();
        $destination = public_path('assets/images/user/gallery');
        if(!file_exists($destination)){
            mkdir($destination,0755,true);
        }
        $file->move($destination, $filename);

        // ensure basic info exists
        $basic = $user->basicInfo ?: $user->basicInfo()->create([]);
        if($request->type == \App\Models\Gallery::TYPE_HOROSCOPE){
            $basic->horoscope_file = $filename;
        }
        if($request->type == \App\Models\Gallery::TYPE_ID_PROOF){
            $basic->id_proof_file = $filename;
        }
        $basic->save();

        // keep gallery record for moderation
        $user->galleries()->create([
            'image' => $filename,
            'status' => \App\Models\Gallery::STATUS_PENDING,
            'type' => $request->type,
        ]);

        return redirect()->route('admin.users.edit', $user->id)->with('success','Document uploaded successfully.');
    }
}