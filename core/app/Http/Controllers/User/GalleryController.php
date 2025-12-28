<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\Gallery;
use App\Models\UserLimitation;
use Illuminate\Http\Request;
use App\Rules\FileTypeValidate;
use Illuminate\Support\Facades\File;

class GalleryController extends Controller
{
    public function index()
    {
        $pageTitle = 'Gallery';
        $user = auth()->user()->load([
            'limitation',
            'galleries' => function($query){
                $query->approved()->latest('id');
            }
        ]);

        $maxLimit = $user->limitation->image_upload_limit;
        return view($this->activeTemplate . 'user.gallery', compact('pageTitle', 'user', 'maxLimit'));
    }

    public function upload(Request $request)
    {
        $request->validate([
            'images' => 'required|array',
            'images.*' => ['required', 'image', new FileTypeValidate(['jpg', 'jpeg', 'png'])],
        ]);

        $user = auth()->user()->load('galleries');

        $userLimitation = UserLimitation::where('user_id', $user->id)->first();

        if (!checkValidityPeriod($userLimitation)) {
            $notify[] = ['error', 'Your package\'s validity period has been expired'];
            return back()->withNotify($notify);
        }

        if ($userLimitation->image_upload_limit != -1 && $userLimitation->image_upload_limit < (count($request->images) + $user->galleries->count())) {
            $notify[] = ['error', 'Image upload limit is over'];
            return back()->withNotify($notify);
        }

        $uploadedImages = [];
        foreach ($request->images as $key => $image) {
            try {
                // Ensure destination directory exists (assets/images/user/gallery relative to base path)
                $destination = base_path('../assets/images/user/gallery');
                if (!File::exists($destination)) {
                    File::makeDirectory($destination, 0755, true);
                }
                $fileName = uniqid('gallery_') . '.' . $image->getClientOriginalExtension();
                $image->move($destination, $fileName);
                $uploadedImage['user_id'] = $user->id;
                $uploadedImage['image']       = $fileName;
                $uploadedImage['status']      = Gallery::STATUS_PENDING;
                $uploadedImage['type']        = Gallery::TYPE_PHOTO;
                $uploadedImage['created_at']  = now();
                $uploadedImages[] = $uploadedImage;
            } catch (\Exception $exp) {
                $notify[] = ['error', 'Couldn\'t upload the image'];
                return back()->withNotify($notify);
            }
        }

        Gallery::insert($uploadedImages);

        $notify[] = ['success', 'Image uploaded successfully'];
        return back()->withNotify($notify);
    }

    public function delete(Request $request)
    {
        $request->validate([
            'gallery_id' => 'required|integer|gt:0'
        ]);

        $gallery = Gallery::where('user_id', auth()->id())->findOrFail($request->gallery_id);
        $path = base_path('../assets/images/user/gallery');
        $filePath = $path . '/' . $gallery->image;
        if (file_exists($filePath)) {
            @unlink($filePath);
        }
        $gallery->delete();

        $notify[] = ['success', 'Image deleted successfully'];
        return back()->withNotify($notify);
    }

    public function deleteUnpublishedImages(Request $request)
    {
        $maxLimit = auth()->user()->limitation->image_upload_limit;
        if ($maxLimit <= 0) abort(404);

        $galleries   = Gallery::where('user_id', auth()->id());
        $total       = (clone $galleries)->count();
        $unpublished = $total - $maxLimit;

        if ($unpublished <= 0) abort(404);

        $galleries = $galleries->latest('id')->skip($maxLimit)->take($unpublished)->get();

        foreach ($galleries as $gallery) {
            $path = base_path('../assets/images/user/gallery');
            $file = $path . '/' . $gallery->image;
            if (file_exists($file)) {
                @unlink($file);
            }
            $gallery->delete();
        }
        $notify[] = ['success', 'Unpublished images has been deleted successfully'];
        return back()->withNotify($notify);
    }
}
